"""
SafeMap-PH Ledger Report Models
Header/Ledger architecture for safety incidents
"""

from models import db
from datetime import datetime
import secrets
from cryptography.fernet import Fernet
from flask import current_app
import base64


class DecryptionError(Exception):
    """Custom exception raised when report description decryption fails"""
    pass

class LedgerReportHeader(db.Model):
    """Ledger Report Header model for safety incidents"""
    
    __tablename__ = 'ledger_report_header'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    _description = db.Column('description', db.Text, nullable=False)  # Encrypted in DB
    category = db.Column(db.String(50), nullable=False, index=True)
    
    # Current Status (derived from ledger or cached here for performance)
    status = db.Column(db.String(30), default='pending_review', index=True)
    severity = db.Column(db.String(20))
    
    # Location
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    city = db.Column(db.String(100), index=True)
    barangay = db.Column(db.String(100))
    address = db.Column(db.String(256))
    
    # Anonymous tracking
    reference_code = db.Column(db.String(20), unique=True, index=True)
    is_anonymous = db.Column(db.Boolean, default=True)
    user_ip = db.Column(db.String(45))
    user_agent = db.Column(db.String(256))
    
    # PNP verification (final state info)
    is_pnp_verified = db.Column(db.Boolean, default=False)
    pnp_case_number = db.Column(db.String(50))
    
    # Link to user who created the report (optional, for internal tracking)
    created_by = db.Column(db.Integer, db.ForeignKey('setup_user.id'), nullable=True)
    image_url = db.Column(db.String(256))
    
    # Soft Delete
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    deleted_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ledger_entries = db.relationship('LedgerReportEntry', backref='header', lazy='dynamic', cascade='all, delete-orphan')
    queue_entry = db.relationship('ReportQueue', backref='report', uselist=False, cascade='all, delete-orphan')
    
    @property
    def description(self):
        """Decrypt description when accessed"""
        if not self._description:
            return None
        try:
            f = Fernet(current_app.config['ENCRYPTION_KEY'].encode())
            return f.decrypt(self._description.encode()).decode()
        except Exception as e:
            current_app.logger.error(f"Decryption error: {e}")
            raise DecryptionError(f"Failed to decrypt report description: {e}")

    @description.setter
    def description(self, value):
        """Encrypt description before saving"""
        if value:
            f = Fernet(current_app.config['ENCRYPTION_KEY'].encode())
            self._description = f.encrypt(value.encode()).decode()
        else:
            self._description = None

    def __repr__(self):
        return f'<LedgerReportHeader {self.id}: {self.title}>'

    def generate_reference_code(self):
        """Generate unique reference code"""
        self.reference_code = f'SMPH-{secrets.token_hex(3).upper()}'
        return self.reference_code

    def add_ledger_entry(self, action, status, actor_id=None, notes=''):
        """Add a new entry to the transaction ledger"""
        entry = LedgerReportEntry(
            report_header_id=self.id,
            action=action,
            status_to=status,
            actor_id=actor_id,
            notes=notes
        )
        self.status = status  # Update current status in header
        db.session.add(entry)
        return entry

    def to_dict(self, include_ledger=False, include_private=False):
        """Convert header to dictionary"""
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'severity': self.severity,
            'status': self.status,
            'reference_code': self.reference_code,
            'is_anonymous': self.is_anonymous,
            'user_ip': self.user_ip,
            'is_pnp_verified': self.is_pnp_verified,
            'pnp_case_number': self.pnp_case_number,
            'location': {
                'latitude': self.latitude,
                'longitude': self.longitude,
                'city': self.city,
                'barangay': self.barangay,
                'address': self.address
            },
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Include admin review details only for admin view
        if include_private:
            data['created_by'] = self.created_by
            data['ledger'] = [entry.to_dict() for entry in self.ledger_entries.order_by(LedgerReportEntry.created_at.asc()).all()]
            
        return data

    def to_public_dict(self):
        """Convert header to public dictionary (no sensitive data)"""
        try:
            return {
                'id': self.id,
                'title': self.title,
                'description': self.description,
                'category': self.category,
                'severity': self.severity,
                'status': self.status,
                'reference_code': self.reference_code,
                'location': {
                    'latitude': self.latitude,
                    'longitude': self.longitude,
                    'city': self.city,
                    'barangay': self.barangay
                },
                'created_at': self.created_at.isoformat() if self.created_at else None
            }
        except Exception as e:
            current_app.logger.error(f"Error converting report {self.id} to public dict: {e}")
            return None


class LedgerReportEntry(db.Model):
    """Ledger Report Entry model for report audit trail"""
    
    __tablename__ = 'ledger_report_entry'
    
    id = db.Column(db.Integer, primary_key=True)
    report_header_id = db.Column(db.Integer, db.ForeignKey('ledger_report_header.id'), nullable=False)
    
    # Action taken (e.g., 'submit', 'approve', 'verify', 'dismiss')
    action = db.Column(db.String(50), nullable=False)
    
    # Status after action
    status_to = db.Column(db.String(30), nullable=False)
    
    # User who took the action
    actor_id = db.Column(db.Integer, db.ForeignKey('setup_user.id'), nullable=True)
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'action': self.action,
            'status_to': self.status_to,
            'actor_id': self.actor_id,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
