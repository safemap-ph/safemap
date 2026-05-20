"""
SafeMap-PH Emergency Contacts Setup Script
Seed default emergency categories and contacts
"""

from app import create_app, db
from models import RefHelpCategory, RefHelpContact

def set_up_emergency_contacts():
    """Seed default emergency categories and contacts"""
    
    app = create_app()
    
    with app.app_context():
        # Check if contacts already exist
        if RefHelpContact.query.first():
            print("[OK] Emergency contacts already seeded")
            return
        
        print("\nSeeding emergency contacts...")
        
        # Categories
        categories = [
            {'name': 'pnp', 'label': 'Philippine National Police', 'icon': 'shield'},
            {'name': 'vawc', 'label': 'VAWC (Violence Against Women and Children)', 'icon': 'heart'},
            {'name': 'dswd', 'label': 'Department of Social Welfare', 'icon': 'users'},
            {'name': 'fire', 'label': 'Bureau of Fire Protection', 'icon': 'flame'},
            {'name': 'medical', 'label': 'Medical Emergency', 'icon': 'heart-pulse'},
            {'name': 'emergency', 'label': 'General Emergency', 'icon': 'siren'},
        ]
        
        created_categories = {}
        for cat in categories:
            category = RefHelpCategory(
                name=cat['name'],
                description=cat['label'],
                icon=cat['icon']
            )
            db.session.add(category)
            db.session.flush()
            created_categories[cat['name']] = category
        
        # Default contacts
        contacts = [
            {'name': 'PNP Emergency Hotline', 'category': 'pnp', 'phone': '117', 'description': 'National Emergency Hotline', 'is_24_7': True},
            {'name': 'PNP Crime Report', 'category': 'pnp', 'phone': '0917-847-5757', 'description': 'Text PNP', 'is_24_7': True},
            {'name': 'WCPD Hotline', 'category': 'vawc', 'phone': '02-8532-5003', 'description': 'Women and Children Protection Center', 'is_24_7': True},
            {'name': 'VAWC Hotline', 'category': 'vawc', 'phone': '1388', 'description': 'Violence Against Women and Children', 'is_24_7': True},
            {'name': 'DSWD Hotline', 'category': 'dswd', 'phone': '02-8931-8101', 'description': 'Department of Social Welfare', 'is_24_7': True},
            {'name': 'DSWD NCR', 'category': 'dswd', 'phone': '0932-529-8293', 'description': 'SWAD Team - NCR', 'is_24_7': True},
            {'name': 'BFP Emergency', 'category': 'fire', 'phone': '117', 'description': 'Bureau of Fire Protection', 'is_24_7': True},
            {'name': 'Red Cross', 'category': 'medical', 'phone': '143', 'description': 'Philippine Red Cross', 'is_24_7': True},
            {'name': 'Emergency 911', 'category': 'emergency', 'phone': '911', 'description': 'National Emergency Hotline', 'is_24_7': True},
            {'name': 'NDRRMC', 'category': 'emergency', 'phone': '02-8911-5061', 'description': 'Disaster Response', 'is_24_7': True},
        ]
        
        for contact_data in contacts:
            category = created_categories.get(contact_data['category'])
            if category:
                contact = RefHelpContact(
                    category_id=category.id,
                    name=contact_data['name'],
                    phone=contact_data['phone'],
                    description=contact_data['description'],
                    is_24_7=contact_data['is_24_7'],
                    is_verified=True,
                    is_active=True
                )
                db.session.add(contact)
        
        db.session.commit()
        print("[OK] Emergency contacts seeded successfully")


if __name__ == '__main__':
    set_up_emergency_contacts()
