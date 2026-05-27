"""
SafeMap-PH Routes Package
API endpoint blueprints
"""

from flask import Blueprint

# Create main API blueprint
api_bp = Blueprint('api', __name__)

# Import routes to register them with the blueprint
# Note: Import at bottom to avoid circular imports
from routes import reports, locations, users, auth, help, otp

__all__ = ['api_bp', 'reports', 'locations', 'users', 'auth', 'help', 'otp']
