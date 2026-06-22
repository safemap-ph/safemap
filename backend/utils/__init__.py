"""
SafeMap-PH Utils Package
Helper functions and decorators
"""

from functools import wraps
from flask import request, jsonify, g
import jwt
from datetime import datetime, timedelta

from models import SetupUser as User
from config import Config


def create_token(user_id, token_type='access'):
    """Create JWT token"""
    if token_type == 'access':
        exp = datetime.utcnow() + timedelta(hours=24)
    else:  # refresh
        exp = datetime.utcnow() + timedelta(days=30)
    
    payload = {
        'user_id': user_id,
        'type': token_type,
        'exp': exp,
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
    return token


def decode_token(token):
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Decode token
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Get user
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is disabled'}), 403
        
        # Set current user in flask g
        g.current_user = user
        
        return f(*args, **kwargs)
    
    return decorated_function


def rate_limit(limit_string):
    """
    Decorator to apply rate limiting to endpoints
    
    Args:
        limit_string: Rate limit specification (e.g., '10 per minute', '30 per minute')
    
    Returns:
        Decorator function that applies rate limiting
        Returns 429 Too Many Requests with Retry-After header when limit exceeded
    """
    from extensions import limiter
    
    def decorator(f):
        # Apply Flask-Limiter decorator with custom error response
        limited_func = limiter.limit(limit_string)(f)
        
        @wraps(limited_func)
        def wrapper(*args, **kwargs):
            return limited_func(*args, **kwargs)
        
        return wrapper
    
    return decorator


def get_current_user():
    """Get current authenticated user"""
    return getattr(g, 'current_user', None)


def validate_json(**kwargs):
    """Decorator to validate JSON request body"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Request must be JSON'}), 400
            
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Request body is empty'}), 400
            
            # Check required fields
            required_fields = kwargs.get('required_fields', [])
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                return jsonify({
                    'error': 'Missing required fields',
                    'missing': missing_fields
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator


def paginate_query(query, page=1, per_page=20):
    """Paginate a SQLAlchemy query"""
    # Limit per_page to max value
    max_per_page = Config.MAX_ITEMS_PER_PAGE
    if per_page > max_per_page:
        per_page = max_per_page
    
    return query.paginate(page=page, per_page=per_page, error_out=False)


def success_response(data=None, message=None, status_code=200):
    """Create a success response"""
    response = {}
    if message:
        response['message'] = message
    if data:
        response.update(data)
    
    return jsonify(response), status_code


def error_response(message, status_code=400, errors=None):
    """Create an error response"""
    response = {'error': message}
    if errors:
        response['errors'] = errors
    
    return jsonify(response), status_code


def log_info(message, **context):
    """
    Log informational message with request and user context
    
    Args:
        message: Log message
        **context: Additional context to include in log
    """
    from flask import current_app
    
    log_context = _get_log_context()
    log_context.update(context)
    
    current_app.logger.info(f"{message} | {log_context}")


def log_warning(message, **context):
    """
    Log warning message with request and user context
    
    Args:
        message: Log message
        **context: Additional context to include in log
    """
    from flask import current_app
    
    log_context = _get_log_context()
    log_context.update(context)
    
    current_app.logger.warning(f"{message} | {log_context}")


def log_error(message, **context):
    """
    Log error message with request and user context
    
    Args:
        message: Log message
        **context: Additional context to include in log
    """
    from flask import current_app
    
    log_context = _get_log_context()
    log_context.update(context)
    
    current_app.logger.error(f"{message} | {log_context}")


def _get_log_context():
    """
    Get request and user context for structured logging
    
    Returns:
        dict: Context dictionary with request and user information
    """
    context = {}
    
    # Add request context if available
    if request:
        context['path'] = request.path
        context['method'] = request.method
        context['remote_addr'] = request.remote_addr
        context['user_agent'] = request.headers.get('User-Agent', 'Unknown')
    
    # Add user context if available
    current_user = get_current_user()
    if current_user:
        context['user_id'] = current_user.id
        context['username'] = current_user.username
        context['role'] = current_user.role
    else:
        context['user_id'] = None
        context['username'] = 'anonymous'
    
    return context


def sanitize_input(text):
    """
    Sanitize user input to prevent injection attacks
    
    Args:
        text: Input string to sanitize
    
    Returns:
        str: Sanitized string with HTML tags stripped, special characters escaped, and whitespace trimmed
    """
    import bleach
    
    if not text:
        return text
    
    # Strip HTML tags
    text = bleach.clean(text, tags=[], strip=True)
    
    # Trim whitespace
    text = text.strip()
    
    return text
