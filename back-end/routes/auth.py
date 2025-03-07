from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validação básica
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'O campo {field} é obrigatório'}), 400
    
    # Verifica se o usuário já existe
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Nome de usuário já existe'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já está em uso'}), 400
    
    # Cria o novo usuário
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Gera o token de acesso
    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'message': 'Usuário registrado com sucesso',
        'user': user.to_dict(),
        'token': access_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validação básica
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    # Busca o usuário pelo email
    user = User.query.filter_by(email=data['email']).first()
    
    # Verifica se o usuário existe e a senha está correta
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Email ou senha inválidos'}), 401
    
    # Gera o token de acesso
    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'message': 'Login realizado com sucesso',
        'user': user.to_dict(),
        'token': access_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        
        # Converte para inteiro se for string
        if isinstance(user_id, str):
            user_id = int(user_id)
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': f'Usuário com ID {user_id} não encontrado'}), 404
            
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 