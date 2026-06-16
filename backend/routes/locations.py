"""
SafeMap-PH Locations API Routes
Handle location-related endpoints
"""

from flask import request, jsonify
from routes import api_bp
from models import SetupLocation as Location, SysAuditLog, db
from utils import paginate_query, require_auth, get_current_user
from datetime import datetime

@api_bp.route('/locations', methods=['GET'])
def get_locations():
    """Get all locations with optional filtering"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    location_type = request.args.get('type')
    city = request.args.get('city')
    
    query = Location.query.filter_by(is_deleted=False)
    
    if location_type:
        query = query.filter(Location.location_type == location_type)
    if city:
        query = query.filter(Location.city.ilike(f'%{city}%'))
    
    pagination = paginate_query(query, page, per_page)
    
    return jsonify({
        'locations': [loc.to_dict() for loc in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    }), 200


@api_bp.route('/locations/<int:location_id>', methods=['GET'])
def get_location(location_id):
    """Get a single location by ID"""
    location = Location.query.filter_by(id=location_id, is_deleted=False).first_or_404()
    return jsonify(location.to_dict()), 200


@api_bp.route('/locations/nearby', methods=['GET'])
def get_nearby_locations():
    """Get locations near a given point"""
    lat = request.args.get('latitude', type=float)
    lng = request.args.get('longitude', type=float)
    radius = request.args.get('radius', 5, type=float)  # default 5km
    
    if not lat or not lng:
        return jsonify({'error': 'Latitude and longitude are required'}), 400
    
    # Simple bounding box query (not precise, but efficient)
    lat_range = radius / 111.0
    lng_range = radius / (111.0 * 0.7)
    
    locations = Location.query.filter_by(is_deleted=False).filter(
        Location.latitude.between(lat - lat_range, lat + lat_range),
        Location.longitude.between(lng - lng_range, lng + lng_range)
    ).all()
    
    return jsonify({
        'center': {'latitude': lat, 'longitude': lng},
        'radius_km': radius,
        'locations': [loc.to_dict() for loc in locations]
    }), 200


@api_bp.route('/locations', methods=['POST'])
@require_auth
def create_location():
    """Create a new location (admin/moderator only)"""
    current_user = get_current_user()
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    
    location = Location(
        name=data['name'],
        latitude=data['latitude'],
        longitude=data['longitude'],
        location_type=data.get('type', 'general'),
        address=data.get('address'),
        city=data.get('city'),
        barangay=data.get('barangay'),
        description=data.get('description'),
        facilities=data.get('facilities'),
        operating_hours=data.get('operating_hours'),
        contact_info=data.get('contact_info'),
        is_verified=data.get('is_verified', False)
    )
    
    db.session.add(location)
    db.session.commit()
    
    # Log the action
    SysAuditLog.log(
        category='location_management',
        action='add_location',
        target_table='setup_location',
        target_id=location.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'name': location.name}
    )
    
    return jsonify({
        'message': 'Location created successfully',
        'location': location.to_dict()
    }), 201


@api_bp.route('/locations/<int:location_id>', methods=['PUT'])
@require_auth
def update_location(location_id):
    """Update an existing location (admin/moderator only)"""
    current_user = get_current_user()
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized'}), 403

    location = Location.query.filter_by(id=location_id, is_deleted=False).first_or_404()
    data = request.get_json()
    
    for key in ['name', 'latitude', 'longitude', 'location_type', 'address', 
                'city', 'barangay', 'description', 'facilities', 
                'operating_hours', 'contact_info', 'is_verified']:
        if key in data:
            setattr(location, key, data[key])
    
    db.session.commit()
    
    # Log the action
    SysAuditLog.log(
        category='location_management',
        action='edit_location',
        target_table='setup_location',
        target_id=location.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'name': location.name}
    )
    
    return jsonify({
        'message': 'Location updated successfully',
        'location': location.to_dict()
    }), 200


@api_bp.route('/locations/<int:location_id>', methods=['DELETE'])
@require_auth
def delete_location(location_id):
    """Soft delete a location (admin only)"""
    current_user = get_current_user()
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    location = Location.query.filter_by(id=location_id, is_deleted=False).first_or_404()
    
    # Soft delete
    location.is_deleted = True
    location.deleted_at = datetime.utcnow()
    db.session.commit()
    
    # Log the action
    SysAuditLog.log(
        category='location_management',
        action='delete_location',
        target_table='setup_location',
        target_id=location.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'name': location.name}
    )
    
    return jsonify({'message': 'Location deleted successfully'}), 200


@api_bp.route('/locations/types', methods=['GET'])
def get_location_types():
    """Get all location types"""
    types = db.session.query(
        Location.location_type,
        db.func.count(Location.id)
    ).filter(Location.is_deleted == False).group_by(Location.location_type).all()
    
    return jsonify({
        'types': [{'type': t, 'count': c} for t, c in types]
    }), 200
