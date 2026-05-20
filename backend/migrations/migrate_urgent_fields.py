"""
Migration: Add is_urgent and contact_phone to ledger_report_header
Run once: python migrations/migrate_urgent_fields.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db

def migrate():
    app = create_app()
    with app.app_context():
        with db.engine.connect() as conn:
            # Check existing columns
            from sqlalchemy import text, inspect
            inspector = inspect(db.engine)
            existing = [c['name'] for c in inspector.get_columns('ledger_report_header')]

            if 'is_urgent' not in existing:
                conn.execute(text(
                    'ALTER TABLE ledger_report_header ADD COLUMN is_urgent BOOLEAN DEFAULT 0'
                ))
                print('Added is_urgent column')
            else:
                print('is_urgent already exists, skipping')

            if 'contact_phone' not in existing:
                conn.execute(text(
                    'ALTER TABLE ledger_report_header ADD COLUMN contact_phone VARCHAR(30)'
                ))
                print('Added contact_phone column')
            else:
                print('contact_phone already exists, skipping')

            conn.commit()
            print('Migration complete.')

if __name__ == '__main__':
    migrate()
