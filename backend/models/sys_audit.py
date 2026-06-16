"""
SafeMap-PH System Audit Log Model
Tracks all system transactions, user actions, and administrative changes
"""

from models import db
from datetime import datetime

class SysAuditLog(db.Model):
    """System Audit Log for tracking all non-report transactions"""
    
    __tablename__ = 'sys_audit_log'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Action category (e.g., 'auth', 'staff_management', 'emergency_contact', 'report_management')
    category = db.Column(db.String(50), nullable=False, index=True)
    
    # Specific action (e.g., 'login', 'logout', 'create_staff', 'edit_staff', 'delete_staff', 'add_contact')
    action = db.Column(db.String(100), nullable=False)
    
    # Target entity (e.g., 'sys_user', 'sys_help_contact', 'trans_report_header')
    target_table = db.Column(db.String(50))
    target_id = db.Column(db.Integer)
    
    # Actor details
    actor_id = db.Column(db.Integer, db.ForeignKey('setup_user.id'), nullable=True)
    actor_ip = db.Column(db.String(45))
    
    # Payload/Change details (JSON format for flexibility)
    details = db.Column(db.JSON)
    notes = db.Column(db.Text)
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'action': self.action,
            'target_table': self.target_table,
            'target_id': self.target_id,
            'actor_id': self.actor_id,
            'actor_ip': self.actor_ip,
            'details': self.details,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    @staticmethod
    def log(category, action, target_table=None, target_id=None, actor_id=None, actor_ip=None, details=None, notes=None):
        """Helper method to create a log entry"""
        entry = SysAuditLog(
            category=category,
            action=action,
            target_table=target_table,
            target_id=target_id,
            actor_id=actor_id,
            actor_ip=actor_ip,
            details=details,
            notes=notes
        )
        db.session.add(entry)
        db.session.commit()
        return entry
