import os
from pathlib import Path

# Diretório base do projeto
BASE_DIR = Path(__file__).resolve().parent

# Diretório para armazenar o banco de dados
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
os.makedirs(INSTANCE_DIR, exist_ok=True)

# Configurações do banco de dados
SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(INSTANCE_DIR, "accounting_system.db")}'
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Configurações da aplicação
DEBUG = True
SECRET_KEY = 'sua_chave_secreta_aqui'  # Em produção, use uma chave segura e não a armazene no código

# Chave JWT fixa - NÃO USE ESTA CHAVE EM PRODUÇÃO!
JWT_SECRET_KEY = 'chave_jwt_fixa_para_desenvolvimento_123456789'
