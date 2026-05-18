"""
SafeMap-PH Risk Status Setup Script
Seed default report categories and their settings
"""

from app import create_app, db
from models import SetupReportCategory

def set_up_risk_status():
    """Seed default report categories for incident classification"""
    
    app = create_app()
    
    with app.app_context():
        # Check if categories already exist
        if SetupReportCategory.query.first():
            print("[OK] Risk status categories already seeded")
            return
        
        print("\nSeeding report categories (risk status)...")
        
        # Categories mapping
        categories = [
            {'name': 'sexual_assault', 'label': 'Sexual Assault', 'priority': 'critical', 'icon': 'alert-circle'},
            {'name': 'physical_abuse', 'label': 'Physical Abuse', 'priority': 'critical', 'icon': 'alert-circle'},
            {'name': 'domestic_violence', 'label': 'Domestic Violence', 'priority': 'critical', 'icon': 'alert-circle'},
            {'name': 'stalking', 'label': 'Stalking', 'priority': 'high', 'icon': 'alert-triangle'},
            {'name': 'verbal_abuse', 'label': 'Verbal Abuse', 'priority': 'medium', 'icon': 'alert-triangle'},
            {'name': 'emotional_abuse', 'label': 'Emotional Abuse', 'priority': 'medium', 'icon': 'alert-triangle'},
            {'name': 'other', 'label': 'Other Incident', 'priority': 'low', 'icon': 'info'},
        ]
        
        for cat_data in categories:
            category = SetupReportCategory(
                name=cat_data['name'],
                label=cat_data['label'],
                priority=cat_data['priority'],
                icon=cat_data['icon'],
                is_active=True
            )
            db.session.add(category)
        
        db.session.commit()
        print("[OK] Risk status categories seeded successfully")


if __name__ == '__main__':
    set_up_risk_status()
