"""
SafeMap-PH Database Setup Script
Initialize database tables using new sys_ and trans_ naming convention
"""

import os
import getpass
import re
from app import create_app, db


def validate_password(password):
    """
    Validate password strength
    Requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    return True, "Password is valid"


def set_up_database():
    """Initialize the database with tables and default admin user"""
    
    app = create_app()
    
    with app.app_context():
        # Create all tables
        print("Creating database tables...")
        db.create_all()
        print("[OK] Tables created successfully")
        
        # Import models
        from models import SetupUser
        
        # Check if admin exists
        admin = SetupUser.query.filter_by(username='admin').first()
        if not admin:
            print("\nCreating default admin user...")
            
            # Get admin password from environment or prompt
            admin_password = os.environ.get('ADMIN_PASSWORD')
            
            if not admin_password:
                print("\nADMIN_PASSWORD environment variable not set.")
                print("Please enter a secure admin password.")
                print("Requirements: min 8 chars, uppercase, lowercase, and digit")
                
                while True:
                    admin_password = getpass.getpass('Enter admin password: ').strip()
                    is_valid, message = validate_password(admin_password)
                    
                    if is_valid:
                        # Confirm password
                        confirm_password = getpass.getpass('Confirm admin password: ').strip()
                        if admin_password == confirm_password:
                            break
                        else:
                            print("Passwords do not match. Please try again.\n")
                            print(f"Debug: Password length: {len(admin_password)}, Confirm length: {len(confirm_password)}")
                    else:
                        print(f"Invalid password: {message}\n")
            else:
                # Validate password from environment
                is_valid, message = validate_password(admin_password)
                if not is_valid:
                    raise ValueError(f"ADMIN_PASSWORD from environment is invalid: {message}")
            
            admin = SetupUser(
                username='admin',
                email='admin@safemap.ph',
                full_name='System Administrator',
                role='admin',
                is_admin=True,
                is_active=True
            )
            admin.set_password(admin_password)
            db.session.add(admin)
            db.session.commit()
            print("✓ Admin user created successfully")
        else:
            print("\n[OK] Admin user already exists")
        
        print("\n" + "="*50)
        print("Database setup complete!")
        print("="*50)
        print(f"\nDatabase: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print("\nNext steps:")
        print("1. Run 'python setup_emergency_contacts.py' to seed emergency contacts")
        print("2. Run 'python setup_risk_status.py' to seed report categories")
        print("3. Run 'python run.py' to start the backend server")


if __name__ == '__main__':
    set_up_database()
