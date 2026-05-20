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


def reset_admin_password():
    """Reset the admin user password"""
    
    app = create_app()
    
    with app.app_context():
        # Import models
        from models import SetupUser
        
        # Find admin user
        admin = SetupUser.query.filter_by(username='admin').first()
        
        if not admin:
            print("Error: Admin user not found!")
            print("Please run setup_database.py first.")
            return
        
        print("Admin Password Reset")
        print("=" * 50)
        print("\nRequirements: min 8 chars, uppercase, lowercase, and digit\n")
        
        while True:
            new_password = getpass.getpass('Enter new admin password: ')
            is_valid, message = validate_password(new_password)
            
            if is_valid:
                # Confirm password
                confirm_password = getpass.getpass('Confirm new admin password: ')
                if new_password == confirm_password:
                    break
                else:
                    print("Passwords do not match. Please try again.\n")
            else:
                print(f"Invalid password: {message}\n")
        
        # Set new password
        admin.set_password(new_password)
        db.session.commit()
        
        print("\n✓ Admin password reset successfully!")
        print("\nYou can now log in with:")
        print(f"  Username: admin")
        print(f"  Password: (the password you just set)")


if __name__ == '__main__':
    reset_admin_password()