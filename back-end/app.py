from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required
from models import db, User
import config
from routes.auth import auth_bp
from routes.accounts import accounts_bp
from routes.transactions import transactions_bp
from routes.reports import reports_bp

def create_app():
    app = Flask(__name__)
    
    # Configurações
    app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = config.SQLALCHEMY_TRACK_MODIFICATIONS
    app.config['SECRET_KEY'] = config.SECRET_KEY
    app.config['DEBUG'] = config.DEBUG
    app.config['JWT_SECRET_KEY'] = config.JWT_SECRET_KEY
    
    # Inicializa extensões
    CORS(app)
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Rota de teste para JWT
    @app.route('/api/test-jwt')
    @jwt_required()
    def test_jwt():
        user_id = get_jwt_identity()
        return jsonify({"msg": "JWT funciona!", "user_id": user_id})
    
    # Registra blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(accounts_bp, url_prefix='/api')
    app.register_blueprint(transactions_bp, url_prefix='/api')
    app.register_blueprint(reports_bp, url_prefix='/api')
    
    # Cria as tabelas do banco de dados
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)
