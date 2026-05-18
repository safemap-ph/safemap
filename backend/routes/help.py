"""
SafeMap-PH Help Directory API Routes
Emergency hotlines, contacts, and safety resources
"""

from flask import request, jsonify
from routes import api_bp
from models import RefHelpCategory as HelpCategory, RefHelpContact as HelpContact, SysAuditLog, db
from utils import require_auth, get_current_user, validate_json
from flask import request, jsonify
from datetime import datetime

# Default emergency contacts for seeding
DEFAULT_CONTACTS = [
    # PNP
    {'name': 'PNP Hotline', 'category': 'pnp', 'phone': '117', 'description': 'National Emergency Hotline', 'is_24_7': True},
    {'name': 'PNP Crime Report', 'category': 'pnp', 'phone': '0917-847-5757', 'description': 'Text PNP', 'is_24_7': True},
    # WCPD
    {'name': 'WCPD Hotline', 'category': 'wcpd', 'phone': '02-8532-5003', 'description': 'Women and Children Protection Center', 'is_24_7': True},
    # VAWC
    {'name': 'VAWC Hotline', 'category': 'vawc', 'phone': '1388', 'description': 'Violence Against Women and Children', 'is_24_7': True},
    # DSWD
    {'name': 'DSWD Hotline', 'category': 'dswd', 'phone': '02-8931-8101', 'description': 'Department of Social Welfare and Development', 'is_24_7': True},
    {'name': 'DSWD SWAD', 'category': 'dswd', 'phone': '0932-529-8293', 'description': 'SWAD Team - NCR', 'is_24_7': True},
    # Fire
    {'name': 'BFP Hotline', 'category': 'fire', 'phone': '117', 'description': 'Bureau of Fire Protection Emergency', 'is_24_7': True},
    # Medical
    {'name': 'Red Cross', 'category': 'medical', 'phone': '143', 'description': 'Philippine Red Cross Emergency', 'is_24_7': True},
    {'name': 'Medical City', 'category': 'medical', 'phone': '02-8988-1000', 'description': 'The Medical City Hospital', 'is_24_7': False},
    # Disaster
    {'name': 'NDRRMC', 'category': 'disaster', 'phone': '02-8911-5061', 'description': 'National Disaster Risk Reduction and Management Council', 'is_24_7': True},
    # Emergency
    {'name': 'Emergency 911', 'category': 'emergency', 'phone': '911', 'description': 'National Emergency Hotline', 'is_24_7': True},
]


@api_bp.route('/help/categories', methods=['GET'])
def get_help_categories():
    """Get all help categories"""
    categories = HelpCategory.query.filter_by(is_active=True, is_deleted=False)\
        .order_by(HelpCategory.display_order).all()
    
    return jsonify({
        'categories': [c.to_dict() for c in categories]
    }), 200


@api_bp.route('/help/contacts', methods=['GET'])
def get_all_contacts():
    """Get all emergency contacts"""
    category = request.args.get('category')
    
    if category:
        # For simplicity, we filter in code here if model doesn't have a clean query method
        category_obj = HelpCategory.query.filter_by(name=category, is_deleted=False).first()
        if category_obj:
            contacts = HelpContact.query.filter_by(category_id=category_obj.id, is_active=True, is_deleted=False).all()
        else:
            contacts = []
    else:
        contacts = HelpContact.query.filter_by(is_active=True, is_deleted=False).all()
    
    return jsonify({
        'contacts': [c.to_dict() for c in contacts]
    }), 200


@api_bp.route('/help/emergency', methods=['GET'])
def get_emergency_contacts():
    """Get all emergency contacts (alias for /help/contacts with different response key)"""
    category = request.args.get('category')
    
    if category:
        category_obj = HelpCategory.query.filter_by(name=category, is_deleted=False).first()
        if category_obj:
            contacts = HelpContact.query.filter_by(category_id=category_obj.id, is_active=True, is_deleted=False).all()
        else:
            contacts = []
    else:
        contacts = HelpContact.query.filter_by(is_active=True, is_deleted=False).all()
    
    return jsonify({
        'emergency_contacts': [c.to_dict() for c in contacts]
    }), 200


@api_bp.route('/help/contacts/<int:contact_id>', methods=['GET'])
def get_contact(contact_id):
    """Get a single contact"""
    contact = HelpContact.query.filter_by(id=contact_id, is_deleted=False).first_or_404()
    return jsonify(contact.to_dict()), 200


@api_bp.route('/help/contacts', methods=['POST'])
@require_auth
def create_contact():
    """Create new contact (admin only)"""
    current_user = get_current_user()
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Get or create category
    category_name = data.get('category', 'other')
    category = HelpCategory.query.filter_by(name=category_name).first()
    if not category:
        category = HelpCategory(name=category_name, description=data.get('category_label', category_name))
        db.session.add(category)
        db.session.commit()
    
    contact = HelpContact(
        category_id=category.id,
        name=data['name'],
        description=data.get('description'),
        phone=data.get('phone'),
        phone_alt=data.get('phone_alt'),
        email=data.get('email'),
        website=data.get('website'),
        address=data.get('address'),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        operating_hours=data.get('operating_hours'),
        is_24_7=data.get('is_24_7', False),
        created_by=current_user.id
    )
    
    db.session.add(contact)
    db.session.commit()
    
    # Log the action
    SysAuditLog.log(
        category='emergency_contact',
        action='add_contact',
        target_table='ref_help_contact',
        target_id=contact.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'name': contact.name, 'category': contact.category.name if contact.category else None}
    )
    
    return jsonify({
        'message': 'Contact created successfully',
        'contact': contact.to_dict()
    }), 201


@api_bp.route('/help/contacts/<int:contact_id>', methods=['PUT'])
@require_auth
def update_contact(contact_id):
    """Update contact (admin only)"""
    current_user = get_current_user()
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    contact = HelpContact.query.filter_by(id=contact_id, is_deleted=False).first_or_404()
    data = request.get_json()
    
    # Update fields
    for field in ['name', 'description', 'phone', 'phone_alt', 'email', 
                  'website', 'address', 'latitude', 'longitude', 
                  'operating_hours', 'is_24_7', 'is_active', 'is_verified']:
        if field in data:
            setattr(contact, field, data[field])
    
    # Update category
    if 'category' in data:
        category = HelpCategory.query.filter_by(name=data['category']).first()
        if category:
            contact.category_id = category.id
    
    db.session.commit()
    
    # Log the action
    SysAuditLog.log(
        category='emergency_contact',
        action='edit_contact',
        target_table='ref_help_contact',
        target_id=contact.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'name': contact.name}
    )
    
    return jsonify({
        'message': 'Contact updated successfully',
        'contact': contact.to_dict()
    }), 200


@api_bp.route('/help/contacts/<int:contact_id>', methods=['DELETE'])
@require_auth
def delete_contact(contact_id):
    """Soft delete contact (admin only)"""
    current_user = get_current_user()
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    contact = HelpContact.query.filter_by(id=contact_id, is_deleted=False).first_or_404()
    
    # Soft delete
    contact.is_deleted = True
    contact.deleted_at = datetime.utcnow()
    contact.is_active = False
    db.session.commit()
    
    # Log the action
    SysAuditLog.log(
        category='emergency_contact',
        action='delete_contact',
        target_table='ref_help_contact',
        target_id=contact.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'name': contact.name}
    )
    
    return jsonify({'message': 'Contact deleted successfully'}), 200
