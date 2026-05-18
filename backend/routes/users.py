"""
SafeMap-PH Users API Routes
Handle user management endpoints
"""

from flask import request, jsonify
from routes import api_bp
from models import SetupUser as User, SysAuditLog, db
from utils import validate_json, get_current_user, require_auth
from datetime import datetime

@api_bp.route('/users', methods=['GET'])
@require_auth
def get_users():
    """Get all users (admin only)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Check if current user is admin
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    pagination = User.query.filter_by(is_deleted=False).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'users': [user.to_dict() for user in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    }), 200


@api_bp.route('/users/<int:user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    """Get a user by ID"""
    current_user = get_current_user()
    
    # Users can only view their own profile unless admin
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.filter_by(id=user_id, is_deleted=False).first_or_404()
    return jsonify(user.to_dict()), 200


@api_bp.route('/users', methods=['POST'])
@validate_json(required_fields=['username', 'email', 'password'])
@require_auth
def create_user():
    """Register a new user (Admin only)"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403

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
    
    # Log the action
    SysAuditLog.log(
        category='staff_management',
        action='create_staff',
        target_table='setup_user',
        target_id=user.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'username': user.username, 'role': user.role}
    )
    
    return jsonify({
        'message': 'User created successfully',
        'user': user.to_dict()
    }), 201


@api_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_auth
def update_user(user_id):
    """Update user profile"""
    current_user = get_current_user()
    
    # Users can only update their own profile unless admin
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.filter_by(id=user_id, is_deleted=False).first_or_404()
    data = request.get_json()
    
    # Fields that users can update
    updatable = ['full_name', 'phone', 'profile_image']
    
    # Fields that only admins can update
    admin_updatable = ['role', 'is_active', 'is_verified']
    
    for field in updatable:
        if field in data:
            setattr(user, field, data[field])
    
    if current_user.is_admin:
        for field in admin_updatable:
            if field in data:
                setattr(user, field, data[field])
    
    # Handle password change separately
    if 'new_password' in data:
        if not current_user.check_password(data.get('current_password', '')):
            return jsonify({'error': 'Current password is incorrect'}), 400
        user.set_password(data['new_password'])
    
    user.save()
    
    # Log the action
    SysAuditLog.log(
        category='staff_management',
        action='edit_staff',
        target_table='setup_user',
        target_id=user.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'updated_fields': list(data.keys())}
    )
    
    return jsonify({
        'message': 'User updated successfully',
        'user': user.to_dict()
    }), 200


@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_auth
def delete_user(user_id):
    """Soft delete user"""
    current_user = get_current_user()
    
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
        
    user = User.query.filter_by(id=user_id, is_deleted=False).first_or_404()
    
    # Soft delete
    user.is_deleted = True
    user.deleted_at = datetime.utcnow()
    user.is_active = False
    db.session.commit()
    
    # Log the action
    SysAuditLog.log(
        category='staff_management',
        action='delete_staff',
        target_table='setup_user',
        target_id=user.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'username': user.username}
    )
    
    return jsonify({'message': 'User deleted successfully'}), 200


@api_bp.route('/users/me', methods=['GET'])
@require_auth
def get_current_user_profile():
    """Get current user profile"""
    current_user = get_current_user()
    return jsonify(current_user.to_dict()), 200


@api_bp.route('/users/me/reports', methods=['GET'])
@require_auth
def get_user_reports():
    """Get reports created by current user"""
    current_user = get_current_user()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    from models import LedgerReportHeader as Report
    pagination = Report.query.filter_by(created_by=current_user.id, is_deleted=False)\
        .order_by(Report.created_at.desc())\
        .paginate(page=page, per_page=per_page)
    
    return jsonify({
        'reports': [r.to_dict() for r in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    }), 200
