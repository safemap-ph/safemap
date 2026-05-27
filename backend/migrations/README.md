# Database Migrations

This directory contains database migration scripts for the SafeMap-PH backend.

## Available Migrations

### migrate_verified_status.py

**Purpose**: Updates the report status naming from 'verified_pnp' to 'verified' for consistency.

**Changes**:

- Updates `ledger_report_header.status` column: 'verified_pnp' → 'verified'
- Updates `ledger_report_entry.status_to` column: 'verified_pnp' → 'verified'

**Usage**:

```bash
cd safemap/backend
python migrations/migrate_verified_status.py
```

**Prerequisites**:

- Database connection configured in `config.py`
- Flask application properly set up
- Database backup recommended before running

**Output**:
The script will display:

- Number of records updated in each table
- Verification that no old status values remain
- Current count of records with the new 'verified' status

**Rollback**:
If you need to rollback this migration, you can run:

```sql
UPDATE ledger_report_header SET status = 'verified_pnp' WHERE status = 'verified';
UPDATE ledger_report_entry SET status_to = 'verified_pnp' WHERE status_to = 'verified';
```

## Running Migrations

1. **Backup your database** before running any migration
2. Navigate to the backend directory: `cd safemap/backend`
3. Run the migration script: `python migrations/<migration_script>.py`
4. Verify the output shows successful completion
5. Test the application to ensure everything works correctly

### migrate_queue_and_in_progress.py

**Purpose**: Adds the report processing queue table and updates report status naming from
`approved_awareness` to `in_progress`.

**Changes**:

- Creates `queue` table (if missing)
- Updates `ledger_report_header.status`: `approved_awareness` → `in_progress`
- Updates `ledger_report_entry.status_to`: `approved_awareness` → `in_progress`
- Backfills `queue` rows for existing reports

**Usage**:

```bash
cd safemap/backend
python migrations/migrate_queue_and_in_progress.py
```

**Rollback**:

```bash
python migrations/migrate_queue_and_in_progress.py --rollback
```

## Creating New Migrations

When creating new migration scripts:

1. Create a descriptive filename: `migrate_<description>.py`
2. Include comprehensive documentation in the script header
3. Add verification steps to confirm the migration succeeded
4. Document the changes in this README
5. Test the migration on a development database first
