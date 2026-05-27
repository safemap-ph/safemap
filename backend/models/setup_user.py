"""
SafeMap-PH Setup User Model
User authentication and profile management
"""

from models import db
from datetime import datetime
import hashlib
import secrets

class SetupUser(db.Model):
    """System User model for authentication and profile"""
    
    __tablename__ = 'setup_user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    profile_image = db.Column(db.String(256))
    role = db.Column(db.String(20), default='user')  # user, moderator, admin
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)
    
    # Soft Delete
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    deleted_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    reports = db.relationship('LedgerReportHeader', backref='creator', lazy='dynamic', foreign_keys='LedgerReportHeader.created_by')
    actions = db.relationship('LedgerReportEntry', backref='actor', lazy='dynamic', foreign_keys='LedgerReportEntry.actor_id')
    queue_assignments = db.relationship('ReportQueue', backref='assignee', lazy='dynamic', foreign_keys='ReportQueue.assigned_to')
    
    def __repr__(self):
        return f'<SetupUser {self.username}>'
    
    def set_password(self, password):
        """Hash and set password"""
        # Generate salt
        salt = secrets.token_hex(16)
        # Hash password with salt
        hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        password_hash = salt + hash_obj.hex()
        self.password_hash = password_hash
    
    def check_password(self, password):
        """Verify password against stored hash"""
        if not self.password_hash:
            return False
        
        try:
            # Extract salt and hash
            salt = self.password_hash[:32]
            stored_hash = self.password_hash[32:]
            # Hash provided password
            hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return hash_obj.hex() == stored_hash
        except Exception:
            return False
    
    def to_dict(self, include_email=False):
        """Convert user to dictionary"""
        data = {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'phone': self.phone,
            'profile_image': self.profile_image,
            'role': self.role,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_email:
            data['email'] = self.email
        
        return data
    
    def save(self):
        """Save user to database"""
        db.session.add(self)
        db.session.commit()
    
    def delete(self):
        """Delete user from database"""
        db.session.delete(self)
        db.session.commit()
    
    @staticmethod
    def get_by_username(username):
        """Get user by username"""
        return SetupUser.query.filter_by(username=username).first()
    
    @staticmethod
    def get_by_email(email):
        """Get user by email"""
        return SetupUser.query.filter_by(email=email).first()
