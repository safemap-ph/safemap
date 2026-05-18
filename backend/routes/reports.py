"""
SafeMap-PH Reports API Routes
Handle safety report workflow - Public submission, Admin review
"""

from flask import request, jsonify
from routes import api_bp
from models import LedgerReportHeader as Report, SetupReportCategory as ReportCategory, LedgerReportEntry as ReportLedger, ReportQueue, SysAuditLog, db
from sqlalchemy.exc import OperationalError
from utils import validate_json, paginate_query, require_auth, get_current_user, rate_limit, sanitize_input
from flask import request, jsonify
from datetime import datetime

# Required fields for report submission
REPORT_REQUIRED_FIELDS = ['title', 'description', 'latitude', 'longitude', 'category']
REPORT_OPTIONAL_FIELDS = ['severity', 'barangay', 'address', 'image_url']


def upsert_report_queue(report, status, assigned_to=None, notes=None, priority=None):
    try:
        queue_entry = ReportQueue.query.filter_by(report_header_id=report.id).first()
    except OperationalError:
        # Table missing or locked; skip queue update to avoid failing the request
        return None
    if not queue_entry:
        queue_entry = ReportQueue(
            report_header_id=report.id,
            status=status,
            priority=priority or report.severity or 'medium',
            assigned_to=assigned_to,
            notes=notes,
        )
        db.session.add(queue_entry)
    else:
        queue_entry.status = status
        if priority:
            queue_entry.priority = priority
        if assigned_to is not None:
            queue_entry.assigned_to = assigned_to
        if notes is not None:
            queue_entry.notes = notes
    return queue_entry


@api_bp.route('/reports/public', methods=['GET'])
@rate_limit('30 per minute')
def get_public_reports():
    """Get all reports for public heatmap - includes all statuses for transparency"""
    category = request.args.get('category')
    city = request.args.get('city')
    
    # Include all statuses: pending, approved, verified, dismissed, false, spam
    query = Report.query.filter(
        Report.status.in_(['pending_review', 'in_progress', 'verified', 'dismissed', 'false_report', 'spam'])
    )
    
    if category:
        query = query.filter(Report.category == category)
    if city:
        query = query.filter(Report.city.ilike(f'%{city}%'))
    
    reports = query.order_by(Report.created_at.desc()).all()
    
    return jsonify({
        'reports': [r.to_public_dict() for r in reports if r.to_public_dict()],
        'total': len(reports)
    }), 200


@api_bp.route('/reports/pending', methods=['GET'])
@require_auth
def get_pending_reports():
    """Get pending reports for admin review"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Enforce pagination limit (Bug 8 fix)
    from config import Config
    per_page = min(per_page, Config.MAX_ITEMS_PER_PAGE)
    
    # "Need Review" should show pending_review and in_progress reports
    query = Report.query.filter(Report.status.in_(['pending_review', 'in_progress']))
    
    pagination = paginate_query(query.order_by(Report.created_at.desc()), page, per_page)
    
    return jsonify({
        'reports': [r.to_dict(include_private=True) for r in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    }), 200


@api_bp.route('/reports', methods=['GET'])
@require_auth
def get_all_reports():
    """Get all reports (admin view)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    category = request.args.get('category')
    city = request.args.get('city')
    
    # Enforce pagination limit (Bug 8 fix)
    from config import Config
    per_page = min(per_page, Config.MAX_ITEMS_PER_PAGE)
    
    query = Report.query
    
    # Apply filters
    if status:
        query = query.filter(Report.status == status)
    if category:
        query = query.filter(Report.category == category)
    if city:
        query = query.filter(Report.city.ilike(f'%{city}%'))
    
    pagination = paginate_query(query.order_by(Report.created_at.desc()), page, per_page)
    
    return jsonify({
        'reports': [r.to_dict(include_private=True) for r in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    }), 200


@api_bp.route('/reports/<int:report_id>', methods=['GET'])
def get_report(report_id):
    """Get a single report"""
    report = Report.query.get_or_404(report_id)
    
    # Public can only see approved reports
    if report.status not in ['in_progress', 'verified']:
        # Check if user is authenticated admin
        try:
            current_user = get_current_user()
            if not current_user or not current_user.is_admin:
                return jsonify({'error': 'Report not found'}), 404
        except:
            return jsonify({'error': 'Report not found'}), 404
    
    return jsonify(report.to_dict()), 200


@api_bp.route('/reports/reference/<reference_code>', methods=['GET'])
@rate_limit('30 per minute')
def get_report_by_reference(reference_code):
    """Get report by reference code"""
    report = Report.query.filter_by(reference_code=reference_code).first()
    
    if not report:
        return jsonify({'error': 'Report not found'}), 404
    
    return jsonify(report.to_dict(include_private=True)), 200


@api_bp.route('/reports/submit', methods=['POST'])
@rate_limit('10 per minute')
@validate_json(required_fields=REPORT_REQUIRED_FIELDS)
def submit_anonymous_report():
    """
    Submit an anonymous report
    Public users can submit without authentication
    """
    data = request.get_json()
    
    # Check required fields
    missing_fields = [f for f in REPORT_REQUIRED_FIELDS if f not in data or not data[f]]
    if missing_fields:
        return jsonify({
            'error': 'Missing required fields',
            'missing': missing_fields,
            'message': 'Please complete all required fields'
        }), 400
    
    # Validate title is not empty (Bug 12 fix)
    if not data.get('title', '').strip():
        return jsonify({
            'error': 'Invalid title',
            'message': 'Title cannot be empty'
        }), 400
    
    # Validate description is not empty (Bug 12 fix)
    if not data.get('description', '').strip():
        return jsonify({
            'error': 'Invalid description',
            'message': 'Description cannot be empty'
        }), 400
    
    # Validate category - query from database
    valid_categories_query = ReportCategory.query.filter_by(is_active=True).all()
    valid_categories = [cat.name for cat in valid_categories_query]
    
    # Fallback to default categories if database is empty
    if not valid_categories:
        valid_categories = [
            'sexual_assault', 'physical_abuse', 'domestic_violence',
            'stalking', 'verbal_abuse', 'emotional_abuse', 'other'
        ]
    
    if data['category'] not in valid_categories:
        return jsonify({
            'error': 'Invalid category',
            'valid_categories': valid_categories
        }), 400
    
    # Validate latitude and longitude (Bug 7 fix)
    if not isinstance(data['latitude'], (int, float)) or not (4.5 <= data['latitude'] <= 21.0):
        return jsonify({
            'error': 'Invalid latitude',
            'message': 'Latitude must be a number between 4.5 and 21.0 (Philippines bounds)'
        }), 400
    
    if not isinstance(data['longitude'], (int, float)) or not (116.0 <= data['longitude'] <= 127.0):
        return jsonify({
            'error': 'Invalid longitude',
            'message': 'Longitude must be a number between 116.0 and 127.0 (Philippines bounds)'
        }), 400
    
    # Check for logged in user (optional tracking)
    try:
        current_user = get_current_user()
        created_by = current_user.id if current_user else None
    except:
        created_by = None

    # Sanitize input fields to prevent injection attacks
    sanitized_title = sanitize_input(data['title'])
    sanitized_description = sanitize_input(data['description'])
    sanitized_address = sanitize_input(data.get('address', ''))

    # Create report header
    report = Report(
        title=sanitized_title,
        description=sanitized_description,
        latitude=data['latitude'],
        longitude=data['longitude'],
        category=data['category'],
        severity=data.get('severity'),
        city=data.get('city'),
        barangay=data.get('barangay'),
        address=sanitized_address if sanitized_address else None,
        image_url=data.get('image_url'),
        is_anonymous=True,
        status='pending_review',
        created_by=created_by,
        user_ip=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    # Generate reference code
    report.generate_reference_code()
    
    # Save header first to get ID
    from models import db
    db.session.add(report)
    db.session.commit()
    
    # Add initial ledger entry
    report.add_ledger_entry(
        action='submit',
        status='pending_review',
        notes='Initial submission'
    )
    upsert_report_queue(report, status='pending_review')
    db.session.commit()
    
    # Run basic safety check (placeholder - can be enhanced)
    safety_check_passed = run_safety_check(report)
    
    return jsonify({
        'message': 'Report submitted successfully',
        'reference_code': report.reference_code,
        'status': 'pending_review',
        'safety_check': 'passed' if safety_check_passed else 'needs_review',
        'safety_notice': get_safety_notice()
    }), 201


def run_safety_check(report):
    """Run basic safety checks on report"""
    # Basic checks - can be enhanced with ML/AI
    checks = []
    
    # Check for minimum description length
    checks.append(len(report.description) >= 10)
    
    # Check for valid coordinates (Philippines bounds)
    lat_valid = 4.5 <= report.latitude <= 21.0
    lng_valid = 116.0 <= report.longitude <= 127.0
    checks.append(lat_valid and lng_valid)
    
    return all(checks)


def get_safety_notice():
    """Get safety notice for users"""
    return (
        "Your report has been submitted and is pending review. "
        "Do not confront any suspects directly. "
        "In case of emergency, dial 911. "
        "Save your reference code for tracking: {code}"
    )


@api_bp.route('/reports/<int:report_id>/approve', methods=['POST'])
@require_auth
def approve_report(report_id):
    """Approve report for public awareness"""
    current_user = get_current_user()
    
    # Check admin role
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    report = Report.query.get_or_404(report_id)
    data = request.get_json() or {}
    notes = data.get('notes', '')
    severity = data.get('severity')
    if severity:
        if severity not in ['critical', 'high', 'medium', 'low']:
            return jsonify({'error': 'Invalid severity'}), 400
        report.severity = severity
    
    # Add ledger entry for approval
    report.add_ledger_entry(
        action='approve',
        status='in_progress',
        actor_id=current_user.id,
        notes=notes
    )
    upsert_report_queue(
        report,
        status='in_progress',
        assigned_to=current_user.id,
        notes=notes,
    )
    
    # Log the system audit
    SysAuditLog.log(
        category='report_management',
        action='approve_report',
        target_table='ledger_report_header',
        target_id=report.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'reference_code': report.reference_code}
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Report moved to in progress',
        'report': report.to_dict()
    }), 200


@api_bp.route('/reports/<int:report_id>/verify', methods=['POST'])
@require_auth
def verify_report_pnp(report_id):
    """Mark report as PNP verified"""
    current_user = get_current_user()
    
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    report = Report.query.get_or_404(report_id)
    data = request.get_json() or {}
    case_number = data.get('case_number')
    notes = data.get('notes', '')

    if report.status in ['verified', 'verified_pnp']:
        return jsonify({
            'message': 'Report is already verified',
            'report': report.to_dict()
        }), 200

    if report.status == 'pending_review':
        return jsonify({
            'error': 'Invalid status transition',
            'message': 'Approve the report before verification.'
        }), 400

    if report.status in ['dismissed', 'spam', 'false_report']:
        return jsonify({
            'error': 'Invalid status transition',
            'message': 'Cannot verify a dismissed or flagged report.'
        }), 400
    
    # Update header
    report.is_pnp_verified = True
    report.pnp_case_number = case_number
    
    # Add ledger entry for verification
    report.add_ledger_entry(
        action='verify',
        status='verified',
        actor_id=current_user.id,
        notes=notes
    )
    upsert_report_queue(
        report,
        status='verified',
        assigned_to=current_user.id,
        notes=notes,
    )
    
    # Log the system audit
    SysAuditLog.log(
        category='report_management',
        action='verify_report',
        target_table='ledger_report_header',
        target_id=report.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'reference_code': report.reference_code, 'case_number': case_number}
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Report verified as PNP confirmed',
        'report': report.to_dict()
    }), 200


@api_bp.route('/reports/<int:report_id>/dismiss', methods=['POST'])
@require_auth
def dismiss_report(report_id):
    """Dismiss report as spam/duplicate"""
    current_user = get_current_user()
    
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    report = Report.query.get_or_404(report_id)
    data = request.get_json() or {}
    reason = data.get('reason', 'Dismissed by admin')
    severity = data.get('severity')
    if severity:
        if severity not in ['critical', 'high', 'medium', 'low']:
            return jsonify({'error': 'Invalid severity'}), 400
        report.severity = severity
    
    # Add ledger entry for dismissal
    report.add_ledger_entry(
        action='dismiss',
        status='dismissed',
        actor_id=current_user.id,
        notes=reason
    )
    upsert_report_queue(
        report,
        status='dismissed',
        assigned_to=current_user.id,
        notes=reason,
    )
    
    # Log the system audit
    SysAuditLog.log(
        category='report_management',
        action='dismiss_report',
        target_table='ledger_report_header',
        target_id=report.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'reference_code': report.reference_code}
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Report dismissed',
        'report': report.to_dict()
    }), 200


@api_bp.route('/reports/<int:report_id>/false', methods=['POST'])
@require_auth
def mark_report_false(report_id):
    """Mark report as false report"""
    current_user = get_current_user()
    
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    report = Report.query.get_or_404(report_id)
    data = request.get_json() or {}
    notes = data.get('notes', 'Marked as false report')
    
    # Add ledger entry
    report.add_ledger_entry(
        action='mark_false',
        status='false_report',
        actor_id=current_user.id,
        notes=notes
    )
    upsert_report_queue(
        report,
        status='false_report',
        assigned_to=current_user.id,
        notes=notes,
    )
    
    # Log the system audit
    SysAuditLog.log(
        category='report_management',
        action='label_false_report',
        target_table='ledger_report_header',
        target_id=report.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'reference_code': report.reference_code}
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Report marked as false',
        'report': report.to_dict()
    }), 200


@api_bp.route('/reports/<int:report_id>/spam', methods=['POST'])
@require_auth
def mark_report_spam(report_id):
    """Mark report as spam"""
    current_user = get_current_user()
    
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    report = Report.query.get_or_404(report_id)
    
    # Add ledger entry for spam
    report.add_ledger_entry(
        action='mark_spam',
        status='spam',
        actor_id=current_user.id,
        notes='Marked as spam'
    )
    upsert_report_queue(
        report,
        status='spam',
        assigned_to=current_user.id,
        notes='Marked as spam',
    )
    
    # Log the system audit
    SysAuditLog.log(
        category='report_management',
        action='label_spam',
        target_table='ledger_report_header',
        target_id=report.id,
        actor_id=current_user.id,
        actor_ip=request.remote_addr,
        details={'reference_code': report.reference_code}
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Report marked as spam',
        'report': report.to_dict()
    }), 200


@api_bp.route('/reports/<int:report_id>/remove-personal', methods=['POST'])
@require_auth
def remove_personal_details(report_id):
    """Placeholder - All reports are already anonymous"""
    return jsonify({'error': 'Not Implemented', 'message': 'Personal data removal not implemented - all reports are anonymous by design'}), 501


@api_bp.route('/reports/stats', methods=['GET'])
@require_auth
def get_report_stats():
    """Get report statistics"""
    from sqlalchemy import func
    from models import db
    
    # Total counts by status
    by_status = db.session.query(
        Report.status,
        func.count(Report.id)
    ).group_by(Report.status).all()
    
    # By category
    by_category = db.session.query(
        Report.category,
        func.count(Report.id)
    ).group_by(Report.category).all()
    
    # By severity
    by_severity = db.session.query(
        Report.severity,
        func.count(Report.id)
    ).group_by(Report.severity).all()
    
    # Total
    total = Report.query.count()
    public_count = Report.query.filter(
        Report.status.in_(['in_progress', 'verified'])
    ).count()
    verified_count = Report.query.filter_by(status='verified').count()
    
    return jsonify({
        'total': total,
        'public_visible': public_count,
        'pnp_verified': verified_count,
        'pending_review': Report.query.filter_by(status='pending_review').count(),
        'by_status': {k if k is not None else 'unassigned': v for k, v in by_status},
        'by_category': {k if k is not None else 'unassigned': v for k, v in by_category},
        'by_severity': {k if k is not None else 'unassigned': v for k, v in by_severity}
    }), 200


@api_bp.route('/reports/heatmap', methods=['GET'])
@require_auth
def get_heatmap_data():
    """Get lat/lng/intensity for all non-dismissed reports (admin heatmap)"""
    # Severity → intensity weight mapping
    intensity_map = {
        'critical': 1.0,
        'high':     0.8,
        'medium':   0.5,
        'low':      0.3
    }

    reports = Report.query.filter(
        Report.status != 'dismissed',
        Report.latitude.isnot(None),
        Report.longitude.isnot(None)
    ).all()

    points = []
    for r in reports:
        intensity = intensity_map.get(r.severity, 0.5)
        points.append({
            'lat':       r.latitude,
            'lng':       r.longitude,
            'intensity': intensity,
            'severity':  r.severity,
            'category':  r.category,
            'status':    r.status,
            'barangay':  r.barangay,
            'city':      r.city
        })

    return jsonify({'points': points, 'total': len(points)}), 200


@api_bp.route('/reports/categories', methods=['GET'])
def get_categories():
    """Get available report categories"""
    categories = ReportCategory.query.filter_by(is_active=True).all()
    if not categories:
        # Fallback to static list if DB is empty
        priority_map = {
            'sexual_assault':    'critical',
            'physical_abuse':    'critical',
            'domestic_violence': 'critical',
            'stalking':          'high',
            'verbal_abuse':      'medium',
            'emotional_abuse':   'medium',
            'other':             'low',
        }
        return jsonify({
            'categories': [
                {
                    'value': c,
                    'name': c,
                    'label': c.replace('_', ' ').title(),
                    'priority': priority_map.get(c, 'medium'),
                    'report_count': Report.query.filter_by(category=c).count()
                }
                for c in [
                    'sexual_assault',    # Sexual Assault
                    'physical_abuse',    # Physical Abuse
                    'domestic_violence', # Domestic Violence
                    'stalking',          # Stalking
                    'verbal_abuse',      # Verbal Abuse
                    'emotional_abuse',   # Emotional Abuse
                    'other'              # Other
                ]
            ]
        }), 200
        
    return jsonify({
        'categories': [c.to_dict() for c in categories]
    }), 200

@api_bp.route('/reports/categories', methods=['POST'])
@require_auth
def create_report_category():
    """Create new report category (admin only)"""
    current_user = get_current_user()
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    category = ReportCategory(
        name=data['name'],
        label=data['label'],
        description=data.get('description'),
        priority=data.get('priority', 'medium')
    )
    category.save()
    return jsonify(category.to_dict()), 201

@api_bp.route('/reports/categories/<int:cat_id>', methods=['PUT'])
@require_auth
def update_report_category(cat_id):
    """Update report category (admin only)"""
    current_user = get_current_user()
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    category = ReportCategory.query.get_or_404(cat_id)
    data = request.get_json()
    
    for field in ['name', 'label', 'description', 'priority', 'is_active']:
        if field in data:
            setattr(category, field, data[field])
            
    category.save()
    return jsonify(category.to_dict()), 200

@api_bp.route('/reports/categories/<int:cat_id>', methods=['DELETE'])
@require_auth
def delete_report_category(cat_id):
    """Delete report category (admin only)"""
    current_user = get_current_user()
    if current_user.role not in ['admin', 'moderator']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    category = ReportCategory.query.get_or_404(cat_id)
    category.delete()
    return jsonify({'message': 'Category deleted'}), 200
