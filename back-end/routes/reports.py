from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Transaction, Account
from sqlalchemy import func, and_
from datetime import datetime

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports/summary', methods=['GET'])
@jwt_required()
def get_summary():
    user_id = get_jwt_identity()
    
    # Parâmetros de filtro
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Busca todas as contas do usuário
    user_accounts = Account.query.filter_by(user_id=user_id).all()
    account_ids = [account.id for account in user_accounts]
    
    # Converte as datas se fornecidas
    filters = [Transaction.account_id.in_(account_ids)]  # Filtra apenas transações das contas do usuário
    if start_date:
        start = datetime.fromisoformat(start_date)
        filters.append(Transaction.date >= start)
    if end_date:
        end = datetime.fromisoformat(end_date)
        filters.append(Transaction.date <= end)
    
    # Consulta para total de créditos
    credits = Transaction.query.filter(
        Transaction.type == 'credit',
        *filters
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0
    
    # Consulta para total de débitos
    debits = Transaction.query.filter(
        Transaction.type == 'debit',
        *filters
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0
    
    # Saldo total de todas as contas do usuário
    total_balance = Account.query.filter_by(user_id=user_id).with_entities(func.sum(Account.balance)).scalar() or 0
    
    return jsonify({
        'total_credits': float(credits),
        'total_debits': float(debits),
        'net_income': float(credits - debits),
        'total_balance': float(total_balance),
        'period': {
            'start_date': start_date,
            'end_date': end_date
        }
    }), 200

@reports_bp.route('/reports/monthly', methods=['GET'])
@jwt_required()
def get_monthly_report():
    user_id = get_jwt_identity()
    year = request.args.get('year', datetime.now().year)
    month = request.args.get('month', datetime.now().month)
    
    # Converte para inteiros
    try:
        year = int(year)
        month = int(month)
    except ValueError:
        return jsonify({'error': 'Ano e mês devem ser números inteiros'}), 400
    
    # Valida o mês
    if month < 1 or month > 12:
        return jsonify({'error': 'Mês deve estar entre 1 e 12'}), 400
    
    # Determina o primeiro e último dia do mês
    if month == 12:
        next_year = year + 1
        next_month = 1
    else:
        next_year = year
        next_month = month + 1
    
    start_date = datetime(year, month, 1)
    end_date = datetime(next_year, next_month, 1)
    
    # Busca todas as contas do usuário
    user_accounts = Account.query.filter_by(user_id=user_id).all()
    account_ids = [account.id for account in user_accounts]
    
    # Consulta para transações do mês das contas do usuário
    transactions = Transaction.query.filter(
        Transaction.account_id.in_(account_ids),
        Transaction.date >= start_date,
        Transaction.date < end_date
    ).order_by(Transaction.date).all()
    
    # Agrupa por tipo de conta
    account_ids_with_transactions = set(t.account_id for t in transactions)
    accounts = {account.id: account for account in Account.query.filter(Account.id.in_(account_ids_with_transactions)).all()}
    
    # Prepara o relatório
    report = {
        'period': {
            'year': year,
            'month': month,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        },
        'summary': {
            'total_credits': sum(t.amount for t in transactions if t.type == 'credit'),
            'total_debits': sum(t.amount for t in transactions if t.type == 'debit')
        },
        'by_account': {}
    }
    
    # Agrupa transações por conta
    for account_id in account_ids_with_transactions:
        account = accounts[account_id]
        account_transactions = [t for t in transactions if t.account_id == account_id]
        
        report['by_account'][account.name] = {
            'account_type': account.type,
            'total_credits': sum(t.amount for t in account_transactions if t.type == 'credit'),
            'total_debits': sum(t.amount for t in account_transactions if t.type == 'debit'),
            'transactions': [t.to_dict() for t in account_transactions]
        }
    
    return jsonify(report), 200
