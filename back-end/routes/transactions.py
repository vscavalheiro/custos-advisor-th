from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Account, Transaction
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validação básica
    required_fields = ['account_id', 'amount', 'type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'O campo {field} é obrigatório'}), 400
    
    # Verifica se a conta existe e pertence ao usuário
    account = Account.query.filter_by(id=data['account_id'], user_id=user_id).first()
    if not account:
        return jsonify({'error': 'Conta não encontrada ou não pertence ao usuário'}), 404
    
    # Valida o tipo de transação
    if data['type'] not in ['credit', 'debit']:
        return jsonify({'error': 'Tipo de transação deve ser credit ou debit'}), 400
    
    # Cria a transação
    transaction = Transaction(
        account_id=data['account_id'],
        amount=abs(float(data['amount'])),  # Garante que o valor seja positivo
        type=data['type'],
        description=data.get('description', ''),
        date=datetime.fromisoformat(data['date']) if 'date' in data else datetime.utcnow()
    )
    
    # Atualiza o saldo da conta
    if data['type'] == 'credit':
        account.balance += transaction.amount
    else:  # debit
        account.balance -= transaction.amount
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify(transaction.to_dict()), 201

@transactions_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    account_id = request.args.get('account_id')
    
    if account_id:
        # Verifica se a conta existe e pertence ao usuário
        account = Account.query.filter_by(id=account_id, user_id=user_id).first()
        if not account:
            return jsonify({'error': 'Conta não encontrada ou não pertence ao usuário'}), 404
        
        transactions = Transaction.query.filter_by(account_id=account_id).order_by(Transaction.date.desc()).all()
    else:
        # Busca todas as contas do usuário
        user_accounts = Account.query.filter_by(user_id=user_id).all()
        account_ids = [account.id for account in user_accounts]
        
        # Busca transações de todas as contas do usuário
        transactions = Transaction.query.filter(
            Transaction.account_id.in_(account_ids)
        ).order_by(Transaction.date.desc()).all()
    
    return jsonify([transaction.to_dict() for transaction in transactions]), 200

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    user_id = get_jwt_identity()
    
    # Busca a transação
    transaction = Transaction.query.get_or_404(transaction_id)
    
    # Verifica se a conta da transação pertence ao usuário
    account = Account.query.filter_by(id=transaction.account_id, user_id=user_id).first()
    if not account:
        return jsonify({'error': 'Transação não pertence ao usuário'}), 403
    
    return jsonify(transaction.to_dict()), 200

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = get_jwt_identity()
    
    # Busca a transação
    transaction = Transaction.query.get_or_404(transaction_id)
    
    # Verifica se a conta da transação pertence ao usuário
    account = Account.query.filter_by(id=transaction.account_id, user_id=user_id).first()
    if not account:
        return jsonify({'error': 'Transação não pertence ao usuário'}), 403
    
    # Reverte o efeito da transação no saldo da conta
    if transaction.type == 'credit':
        account.balance -= transaction.amount
    else:  # debit
        account.balance += transaction.amount
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({'message': 'Transação excluída com sucesso'}), 200
