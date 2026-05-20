"""
Database Migration Script: Add queue table and rename approved_awareness -> in_progress

This script:
1) Creates the queue table if it does not exist
2) Updates status values from 'approved_awareness' to 'in_progress'
   in ledger_report_header and ledger_report_entry
3) Backfills queue rows for existing reports

Usage:
    python migrations/migrate_queue_and_in_progress.py

Requirements:
- Database connection configured in config.py
- Flask application context available
"""

import os
import sys

# Ensure backend root is on sys.path for direct script execution
BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from app import create_app
from models import db, LedgerReportHeader, LedgerReportEntry, ReportQueue
from sqlalchemy import text


def migrate_queue_and_in_progress():
    app = create_app()

    with app.app_context():
        print("Starting migration: queue table + approved_awareness -> in_progress")
        print("-" * 60)

        # 1) Update status values in ledger tables
        print("\n1. Updating ledger_report_header status...")
        header_query = text("""
            UPDATE ledger_report_header
            SET status = 'in_progress'
            WHERE status = 'approved_awareness'
        """)
        header_result = db.session.execute(header_query)
        header_count = header_result.rowcount
        print(f"   Updated {header_count} records in ledger_report_header")

        print("\n2. Updating ledger_report_entry status_to...")
        entry_query = text("""
            UPDATE ledger_report_entry
            SET status_to = 'in_progress'
            WHERE status_to = 'approved_awareness'
        """)
        entry_result = db.session.execute(entry_query)
        entry_count = entry_result.rowcount
        print(f"   Updated {entry_count} records in ledger_report_entry")

        # 2) Create queue table if missing
        print("\n3. Ensuring queue table exists...")
        ReportQueue.__table__.create(bind=db.engine, checkfirst=True)
        print("   Queue table ready")

        # 3) Update queue status values if table already had old status
        print("\n4. Updating queue status values (if any)...")
        queue_status_query = text("""
            UPDATE queue
            SET status = 'in_progress'
            WHERE status = 'approved_awareness'
        """)
        queue_status_result = db.session.execute(queue_status_query)
        queue_status_count = queue_status_result.rowcount
        print(f"   Updated {queue_status_count} records in queue")

        # 4) Backfill queue rows for existing reports
        print("\n5. Backfilling queue rows for existing reports...")
        existing_ids = {
            row[0]
            for row in db.session.query(ReportQueue.report_header_id).all()
        }

        reports = LedgerReportHeader.query.all()
        to_insert = []
        for report in reports:
            if report.id in existing_ids:
                continue
            to_insert.append(
                ReportQueue(
                    report_header_id=report.id,
                    status=report.status or "pending_review",
                    priority=report.severity or "medium",
                )
            )

        if to_insert:
            db.session.add_all(to_insert)
        db.session.commit()

        print(f"   Added {len(to_insert)} queue rows")

        print("\n" + "-" * 60)
        print("Migration completed successfully!")
        print(
            f"Totals: headers={header_count}, entries={entry_count}, queue={queue_status_count}, backfilled={len(to_insert)}"
        )


def rollback_queue_and_in_progress():
    app = create_app()

    with app.app_context():
        print("Starting rollback: in_progress -> approved_awareness")
        print("-" * 60)

        print("\n1. Rolling back ledger_report_header status...")
        header_query = text("""
            UPDATE ledger_report_header
            SET status = 'approved_awareness'
            WHERE status = 'in_progress'
        """)
        header_result = db.session.execute(header_query)
        header_count = header_result.rowcount
        print(f"   Rolled back {header_count} records in ledger_report_header")

        print("\n2. Rolling back ledger_report_entry status_to...")
        entry_query = text("""
            UPDATE ledger_report_entry
            SET status_to = 'approved_awareness'
            WHERE status_to = 'in_progress'
        """)
        entry_result = db.session.execute(entry_query)
        entry_count = entry_result.rowcount
        print(f"   Rolled back {entry_count} records in ledger_report_entry")

        print("\n3. Rolling back queue status values...")
        queue_status_query = text("""
            UPDATE queue
            SET status = 'approved_awareness'
            WHERE status = 'in_progress'
        """)
        queue_status_result = db.session.execute(queue_status_query)
        queue_status_count = queue_status_result.rowcount
        print(f"   Rolled back {queue_status_count} records in queue")

        db.session.commit()

        print("\n" + "-" * 60)
        print("Rollback completed successfully!")
        print(
            f"Totals: headers={header_count}, entries={entry_count}, queue={queue_status_count}"
        )


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--rollback":
        try:
            print("\nWARNING: You are about to rollback the migration!")
            response = input("\nAre you sure you want to continue? (yes/no): ")
            if response.lower() == "yes":
                rollback_queue_and_in_progress()
            else:
                print("Rollback cancelled.")
        except Exception as e:
            print(f"\nRollback failed with error: {e}")
            import traceback

            traceback.print_exc()
            exit(1)
    else:
        try:
            migrate_queue_and_in_progress()
        except Exception as e:
            print(f"\nMigration failed with error: {e}")
            import traceback

            traceback.print_exc()
            exit(1)
