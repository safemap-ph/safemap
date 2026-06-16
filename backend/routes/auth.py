"""
SafeMap-PH Authentication API Routes
Handle login, logout, and token management
"""

from flask import request, jsonify
from datetime import timedelta
from routes import api_bp
from models import SetupUser as User, SysAuditLog
from utils import validate_json, create_token, require_auth, get_current_user

@api_bp.route('/auth/login', methods=['POST'])
@validate_json(required_fields=['username', 'password'])
def login():
    """User login endpoint"""
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    
    # Find user by username or email
    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is disabled'}), 403
    
    # Generate tokens
    access_token = create_token(user.id, 'access')
    refresh_token = create_token(user.id, 'refresh')
    
    # Log the login
    SysAuditLog.log(
        category='auth',
        action='login',
        target_table='setup_user',
        target_id=user.id,
        actor_id=user.id,
        actor_ip=request.remote_addr,
        details={'username': user.username}
    )
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer'
    }), 200


@api_bp.route('/auth/register', methods=['POST'])
@validate_json(required_fields=['username', 'email', 'password'])
def register():
    """User registration endpoint"""
    data = request.get_json()
    
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data.get('full_name'),
        phone=data.get('phone'),
        role=data.get('role', 'user')
    )
    user.set_password(data['password'])
    
    user.save()
    
    # Generate tokens
    access_token = create_token(user.id, 'access')
    refresh_token = create_token(user.id, 'refresh')
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer'
    }), 201


@api_bp.route('/auth/logout', methods=['POST'])
@require_auth
def logout():
    """User logout endpoint"""
    current_user = get_current_user()
    if current_user:
        SysAuditLog.log(
            category='auth',
            action='logout',
            target_table='setup_user',
            target_id=current_user.id,
            actor_id=current_user.id,
            actor_ip=request.remote_addr
        )
    return jsonify({'message': 'Logout successful'}), 200


@api_bp.route('/auth/refresh', methods=['POST'])
@require_auth
def refresh_token():
    """Refresh access token"""
    current_user = get_current_user()
    
    access_token = create_token(current_user.id, 'access')
    
    return jsonify({
        'access_token': access_token,
        'token_type': 'Bearer'
    }), 200


@api_bp.route('/auth/change-password', methods=['POST'])
@require_auth
@validate_json(required_fields=['current_password', 'new_password'])
def change_password():
    """Change user password"""
    data = request.get_json()
    current_user = get_current_user()
    
    if not current_user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 400
    
    current_user.set_password(data['new_password'])
    current_user.save()
    
    return jsonify({'message': 'Password changed successfully'}), 200


@api_bp.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    # Always return success to prevent email enumeration
    if user:
        # In production, send password reset email here
        # For now, just return success
        pass
    
    return jsonify({
        'message': 'If the email exists, a password reset link has been sent'
    }), 200


@api_bp.route('/auth/verify', methods=['GET'])
@require_auth
def verify_token():
    """Verify if token is valid"""
    current_user = get_current_user()
    return jsonify({
        'valid': True,
        'user': current_user.to_dict()
    }), 200
