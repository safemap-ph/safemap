"""
Flask Extensions
Initialize database and other extensions here
"""

from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request, g

# Initialize SQLAlchemy
db = SQLAlchemy()

def get_rate_limit_key():
    """
    Custom key function for rate limiting
    - Authenticated users: exempt from global rate limits (return None)
    - Anonymous users: rate limited by IP address
    """
    # Check if user is authenticated (has valid token)
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        # Authenticated users are exempt from global rate limits
        return None
    
    # Anonymous users are rate limited by IP
    return get_remote_address()

# Initialize Flask-Limiter
limiter = Limiter(
    key_func=get_rate_limit_key,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    headers_enabled=True  # Enable Retry-After and other rate limit headers
)
