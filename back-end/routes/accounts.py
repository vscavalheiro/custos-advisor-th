from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Account, User

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('/accounts', methods=['POST'])
@jwt_required()
def create_account():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validação básica
    if not data or not data.get('name') or not data.get('type'):
        return jsonify({'error': 'Nome e tipo da conta são obrigatórios'}), 400
    
    # Verifica se a conta já existe para este usuário
    existing_account = Account.query.filter_by(name=data['name'], user_id=user_id).first()
    if existing_account:
        return jsonify({'error': 'Uma conta com este nome já existe'}), 400
    
    # Cria a nova conta
    new_account = Account(
        name=data['name'],
        type=data['type'],
        balance=data.get('balance', 0.0),
        user_id=user_id
    )
    
    db.session.add(new_account)
    db.session.commit()
    
    return jsonify(new_account.to_dict()), 201

@accounts_bp.route('/accounts', methods=['GET'])
@jwt_required()
def get_accounts():
    user_id = get_jwt_identity()
    accounts = Account.query.filter_by(user_id=user_id).all()
    return jsonify([account.to_dict() for account in accounts]), 200

@accounts_bp.route('/accounts/<int:account_id>', methods=['GET'])
@jwt_required()
def get_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.filter_by(id=account_id, user_id=user_id).first_or_404()
    return jsonify(account.to_dict()), 200

@accounts_bp.route('/accounts/<int:account_id>', methods=['PUT'])
@jwt_required()
def update_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.filter_by(id=account_id, user_id=user_id).first_or_404()
    data = request.get_json()
    
    if 'name' in data:
        # Verifica se o novo nome já existe em outra conta do mesmo usuário
        existing = Account.query.filter(
            Account.name == data['name'], 
            Account.id != account_id,
            Account.user_id == user_id
        ).first()
        if existing:
            return jsonify({'error': 'Uma conta com este nome já existe'}), 400
        account.name = data['name']
    
    if 'type' in data:
        account.type = data['type']
    
    db.session.commit()
    return jsonify(account.to_dict()), 200

@accounts_bp.route('/accounts/<int:account_id>', methods=['DELETE'])
@jwt_required()
def delete_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.filter_by(id=account_id, user_id=user_id).first_or_404()
    db.session.delete(account)
    db.session.commit()
    return jsonify({'message': 'Conta excluída com sucesso'}), 200
