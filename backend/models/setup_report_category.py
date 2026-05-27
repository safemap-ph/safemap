"""
SafeMap-PH Setup Report Category Model
Incident report categories and their settings
"""

from models import db
from datetime import datetime

class SetupReportCategory(db.Model):
    """Setup Report Category model for incident classification"""
    
    __tablename__ = 'setup_report_category'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    label = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(256))
    icon = db.Column(db.String(50))
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    is_active = db.Column(db.Boolean, default=True)
    
    # Soft Delete
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    deleted_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'label': self.label,
            'description': self.description,
            'icon': self.icon,
            'priority': self.priority,
            'is_active': self.is_active,
            'report_count': self.get_report_count()
        }
        
    def get_report_count(self):
        """Get number of reports in this category"""
        from models import LedgerReportHeader
        return LedgerReportHeader.query.filter_by(category=self.name).count()
    
    def save(self):
        """Save category to database"""
        db.session.add(self)
        db.session.commit()
    
    def delete(self):
        """Delete category from database"""
        db.session.delete(self)
        db.session.commit()
