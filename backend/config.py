"""
SafeMap-PH Backend Configuration
Flask configuration settings
"""

import os
from datetime import timedelta

class ConfigurationError(Exception):
    """Exception raised for configuration validation errors"""
    pass

class Config:
    """Base configuration class"""

    # Secret key for session management
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///samapph.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    # Connection pool settings — prevent pool exhaustion
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,       # test connections before use, drops stale ones
        'pool_recycle': 280,         # recycle connections every ~4.5 min (before MySQL/SQLite timeout)
        'pool_size': 10,             # raise from default 5
        'max_overflow': 20,          # raise from default 10
        'pool_timeout': 30,
    }

    # CORS settings
    # In production set CORS_ORIGINS to a comma-separated list of allowed origins,
    # e.g. "https://safemap.example.com,https://www.safemap.example.com"
    CORS_HEADERS = 'Content-Type'
    _cors_env = os.environ.get('CORS_ORIGINS', '')
    CORS_ORIGINS = (
        [o.strip() for o in _cors_env.split(',') if o.strip()]
        if _cors_env
        else ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000',
              'http://127.0.0.1:5173', 'http://localhost:5000', 'http://127.0.0.1:5000']
    )

    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'json'}

    # API rate limiting
    RATELIMIT_ENABLED = True
    RATELIMIT_DEFAULT = "100 per hour"

    # Encryption key for sensitive data
    # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY') or 'nOpEU9p1YULYS-uMyfTELFguizihtMaMNji4dOya3Z4='

    # Pagination
    ITEMS_PER_PAGE = 20
    MAX_ITEMS_PER_PAGE = 100

    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

    @classmethod
    def validate_production_config(cls):
        """Validate that critical secrets are not using default values in production."""
        env = os.environ.get('FLASK_ENV', 'development')
        if env == 'production':
            if cls.SECRET_KEY == 'dev-secret-key-change-in-production':
                raise ConfigurationError(
                    "SECRET_KEY must be set via environment variable in production."
                )
            if cls.JWT_SECRET_KEY == 'jwt-secret-key-change-in-production':
                raise ConfigurationError(
                    "JWT_SECRET_KEY must be set via environment variable in production."
                )


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SQLALCHEMY_ECHO = False

    # HTTPS enforcement
    FORCE_HTTPS = os.environ.get('FORCE_HTTPS', 'False').lower() == 'true'
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    def __init__(self):
        super().__init__()
        Config.validate_production_config()


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


# Configuration dictionary for easy switching
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
