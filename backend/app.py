"""
SafeMap-PH Backend - Python Flask Application
Main application entry point
"""

from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from extensions import db, limiter

def create_app(config_class=None):
    """Application factory for creating Flask app instances"""
    from config import config_by_name
    
    if config_class is None:
        config_class = config_by_name['development']
    
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    limiter.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization'])
    
    # Register blueprints
    from routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # HTTPS enforcement middleware
    @app.before_request
    def enforce_https():
        """Redirect HTTP to HTTPS in production when FORCE_HTTPS is enabled"""
        # Skip redirect for health check endpoint
        if request.endpoint == 'health_check':
            return None
        
        # Check if HTTPS enforcement is enabled
        if app.config.get('FORCE_HTTPS', False):
            # Check if request is not secure (HTTP)
            if not request.is_secure:
                # Build HTTPS URL
                url = request.url.replace('http://', 'https://', 1)
                return redirect(url, code=301)
        
        return None
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'SafeMap-PH API',
            'version': '1.0.0'
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        # Log 404 error with request details
        user_context = getattr(request, 'current_user', None) if hasattr(request, 'current_user') else None
        user_info = f" (User: {user_context})" if user_context else ""
        app.logger.error(f"404 Not Found: {request.method} {request.path} from {request.remote_addr}{user_info}")
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        # Log 500 error with request details
        user_context = getattr(request, 'current_user', None) if hasattr(request, 'current_user') else None
        user_info = f" (User: {user_context})" if user_context else ""
        app.logger.error(f"500 Internal Error: {request.method} {request.path} from {request.remote_addr}{user_info}")
        return jsonify({'error': 'Internal server error'}), 500
    
    # Rate limit error handler
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify({
            'error': 'Too Many Requests',
            'message': 'Rate limit exceeded. Please try again later.'
        }), 429
    
    return app

# Run the application
if __name__ == '__main__':
    app = create_app()
    app.run(debug=app.config.get('DEBUG', False), host='0.0.0.0', port=5000)
