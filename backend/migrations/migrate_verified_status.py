"""
Database Migration Script: Update verified_pnp status to verified

This script updates all existing records in the database that use the old
'verified_pnp' status name to the new simplified 'verified' status name.

Tables affected:
- ledger_report_header (status column)
- ledger_report_entry (status_to column)

Usage:
    python migrations/migrate_verified_status.py

Requirements:
- Database connection configured in config.py
- Flask application context available
"""

from app import create_app
from models import db, LedgerReportHeader, LedgerReportEntry
from sqlalchemy import text
import sys

def migrate_verified_status():
    """
    Migrate all 'verified_pnp' status values to 'verified'
    """
    app = create_app()
    
    with app.app_context():
        print("Starting migration: verified_pnp -> verified")
        print("-" * 50)
        
        # Update ledger_report_header table
        print("\n1. Updating ledger_report_header...")
        header_query = text("""
            UPDATE ledger_report_header 
            SET status = 'verified' 
            WHERE status = 'verified_pnp'
        """)
        header_result = db.session.execute(header_query)
        header_count = header_result.rowcount
        print(f"   Updated {header_count} records in ledger_report_header")
        
        # Update ledger_report_entry table
        print("\n2. Updating ledger_report_entry...")
        entry_query = text("""
            UPDATE ledger_report_entry 
            SET status_to = 'verified' 
            WHERE status_to = 'verified_pnp'
        """)
        entry_result = db.session.execute(entry_query)
        entry_count = entry_result.rowcount
        print(f"   Updated {entry_count} records in ledger_report_entry")
        
        # Commit the changes
        db.session.commit()
        
        print("\n" + "-" * 50)
        print("Migration completed successfully!")
        print(f"Total records updated: {header_count + entry_count}")
        print("\nSummary:")
        print(f"  - ledger_report_header: {header_count} records")
        print(f"  - ledger_report_entry: {entry_count} records")
        
        # Verify the migration
        print("\n" + "-" * 50)
        print("Verification:")
        remaining_headers = db.session.execute(
            text("SELECT COUNT(*) FROM ledger_report_header WHERE status = 'verified_pnp'")
        ).scalar()
        remaining_entries = db.session.execute(
            text("SELECT COUNT(*) FROM ledger_report_entry WHERE status_to = 'verified_pnp'")
        ).scalar()
        
        if remaining_headers == 0 and remaining_entries == 0:
            print("✓ No 'verified_pnp' status values remaining in database")
        else:
            print(f"⚠ Warning: Found {remaining_headers} headers and {remaining_entries} entries still with 'verified_pnp'")
        
        # Show current verified status counts
        verified_headers = db.session.execute(
            text("SELECT COUNT(*) FROM ledger_report_header WHERE status = 'verified'")
        ).scalar()
        verified_entries = db.session.execute(
            text("SELECT COUNT(*) FROM ledger_report_entry WHERE status_to = 'verified'")
        ).scalar()
        
        print(f"\nCurrent 'verified' status counts:")
        print(f"  - ledger_report_header: {verified_headers} records")
        print(f"  - ledger_report_entry: {verified_entries} records")

def rollback_verified_status():
    """
    Rollback migration: revert 'verified' status values back to 'verified_pnp'
    
    WARNING: This should only be used if you need to revert the migration.
    """
    app = create_app()
    
    with app.app_context():
        print("Starting rollback: verified -> verified_pnp")
        print("-" * 50)
        
        # Rollback ledger_report_header table
        print("\n1. Rolling back ledger_report_header...")
        header_query = text("""
            UPDATE ledger_report_header 
            SET status = 'verified_pnp' 
            WHERE status = 'verified'
        """)
        header_result = db.session.execute(header_query)
        header_count = header_result.rowcount
        print(f"   Rolled back {header_count} records in ledger_report_header")
        
        # Rollback ledger_report_entry table
        print("\n2. Rolling back ledger_report_entry...")
        entry_query = text("""
            UPDATE ledger_report_entry 
            SET status_to = 'verified_pnp' 
            WHERE status_to = 'verified'
        """)
        entry_result = db.session.execute(entry_query)
        entry_count = entry_result.rowcount
        print(f"   Rolled back {entry_count} records in ledger_report_entry")
        
        # Commit the changes
        db.session.commit()
        
        print("\n" + "-" * 50)
        print("Rollback completed successfully!")
        print(f"Total records rolled back: {header_count + entry_count}")
        print("\nSummary:")
        print(f"  - ledger_report_header: {header_count} records")
        print(f"  - ledger_report_entry: {entry_count} records")
        
        # Verify the rollback
        print("\n" + "-" * 50)
        print("Verification:")
        remaining_headers = db.session.execute(
            text("SELECT COUNT(*) FROM ledger_report_header WHERE status = 'verified'")
        ).scalar()
        remaining_entries = db.session.execute(
            text("SELECT COUNT(*) FROM ledger_report_entry WHERE status_to = 'verified'")
        ).scalar()
        
        if remaining_headers == 0 and remaining_entries == 0:
            print("✓ No 'verified' status values remaining in database")
        else:
            print(f"⚠ Warning: Found {remaining_headers} headers and {remaining_entries} entries still with 'verified'")
        
        # Show current verified_pnp status counts
        verified_pnp_headers = db.session.execute(
            text("SELECT COUNT(*) FROM ledger_report_header WHERE status = 'verified_pnp'")
        ).scalar()
        verified_pnp_entries = db.session.execute(
            text("SELECT COUNT(*) FROM ledger_report_entry WHERE status_to = 'verified_pnp'")
        ).scalar()
        
        print(f"\nCurrent 'verified_pnp' status counts:")
        print(f"  - ledger_report_header: {verified_pnp_headers} records")
        print(f"  - ledger_report_entry: {verified_pnp_entries} records")

if __name__ == '__main__':
    # Check for rollback flag
    if len(sys.argv) > 1 and sys.argv[1] == '--rollback':
        try:
            print("\n⚠️  WARNING: You are about to rollback the migration!")
            print("This will revert 'verified' status back to 'verified_pnp'")
            response = input("\nAre you sure you want to continue? (yes/no): ")
            if response.lower() == 'yes':
                rollback_verified_status()
            else:
                print("Rollback cancelled.")
        except Exception as e:
            print(f"\n❌ Rollback failed with error: {e}")
            import traceback
            traceback.print_exc()
            exit(1)
    else:
        try:
            migrate_verified_status()
        except Exception as e:
            print(f"\n❌ Migration failed with error: {e}")
            import traceback
            traceback.print_exc()
            exit(1)
