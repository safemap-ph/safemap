"""
SafeMap-PH Reference Emergency Directory Model
Emergency hotlines, contacts, and safety resources
"""

from models import db
from datetime import datetime

class RefHelpCategory(db.Model):
    """Reference category for help resources"""
    
    __tablename__ = 'ref_help_category'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(200))
    icon = db.Column(db.String(50))  # Icon name
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    
    # Soft Delete
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    deleted_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    contacts = db.relationship('RefHelpContact', backref='category', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'display_order': self.display_order,
            'is_active': self.is_active,
            'contacts': [c.to_dict() for c in self.contacts.filter_by(is_active=True).all()]
        }


class RefHelpContact(db.Model):
    """Reference emergency contact information"""
    
    __tablename__ = 'ref_help_contact'
    
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('ref_help_category.id'))
    
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(256))
    phone = db.Column(db.String(50))
    phone_alt = db.Column(db.String(50))  # Alternative phone
    email = db.Column(db.String(120))
    website = db.Column(db.String(256))
    address = db.Column(db.String(256))
    
    # Location (optional - for map display)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Operating hours
    operating_hours = db.Column(db.String(100))
    is_24_7 = db.Column(db.Boolean, default=False)
    
    # Metadata
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Soft Delete
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    deleted_at = db.Column(db.DateTime)
    
    created_by = db.Column(db.Integer, db.ForeignKey('setup_user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Predefined categories
    CATEGORIES = [
        {'name': 'pnp', 'label': 'Philippine National Police', 'icon': 'police'},
        {'name': 'wcpd', 'label': 'Women and Children Protection Center', 'icon': 'shield'},
        {'name': 'vawc', 'label': 'VAWC (Violence Against Women and Children)', 'icon': 'heart'},
        {'name': 'dswd', 'label': 'Department of Social Welfare', 'icon': 'people'},
        {'name': 'fire', 'label': 'Bureau of Fire Protection', 'icon': 'fire'},
        {'name': 'medical', 'label': 'Medical Emergency', 'icon': 'hospital'},
        {'name': 'disaster', 'label': 'Disaster Response', 'icon': 'alert'},
        {'name': 'emergency', 'label': 'General Emergency', 'icon': 'warning'}
    ]
    
    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category.name if self.category else None,
            'name': self.name,
            'description': self.description,
            'phone': self.phone,
            'phone_alt': self.phone_alt,
            'email': self.email,
            'website': self.website,
            'address': self.address,
            'location': {
                'latitude': self.latitude,
                'longitude': self.longitude
            } if self.latitude and self.longitude else None,
            'operating_hours': self.operating_hours,
            'is_24_7': self.is_24_7,
            'is_verified': self.is_verified
        }
