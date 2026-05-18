# Requirements Document

## Introduction

The SafeMap-PH backend currently uses inconsistent database naming prefixes (`sys_`, `trans_`) that do not clearly communicate the semantic role of each table. This refactor introduces a structured four-prefix convention (`setup_`, `ref_`, `ledger_`, `sys_`) to make the data architecture self-documenting and easier to maintain. All changes must be applied atomically and consistently across model files, class names, `__tablename__` values, foreign key references, `__init__.py` imports, route files, setup scripts, and audit log `target_table` string literals.

## Glossary

- **Refactor_Tool**: The automated or manual process that renames files, classes, table names, and string references across the backend codebase.
- **Model_File**: A Python source file under `backend/models/` that defines one or more SQLAlchemy model classes.
- **Route_File**: A Python source file under `backend/routes/` that defines Flask API endpoints.
- **Setup_Script**: A Python source file at the `backend/` root used to seed or initialize the database (`set_up_database.py`, `set_up_emergency_contacts.py`, `set_up_risk_status.py`).
- **Target_Table_String**: A string literal passed as `target_table=` in `SysAuditLog.log(...)` calls that names the affected database table.
- **FK_Reference**: A SQLAlchemy `db.ForeignKey('table_name.column')` string that references another table by its `__tablename__`.
- **Init_Module**: The file `backend/models/__init__.py` that imports and re-exports all model classes.
- **Prefix_Map**: The mapping from old prefix to new prefix: `sys_user` → `setup_user`, `sys_report_category` → `setup_report_category`, `sys_location` → `setup_location`, `sys_help_category` → `ref_help_category`, `sys_help_contact` → `ref_help_contact`, `trans_report_header` → `ledger_report_header`, `trans_report_ledger` → `ledger_report_entry`. `sys_audit_log` is unchanged.

---

## Requirements

### Requirement 1: Rename sys_user to setup_user

**User Story:** As a backend developer, I want the user table to use the `setup_` prefix, so that it is clearly identified as master/configuration data.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL rename the file `backend/models/sys_user.py` to `backend/models/setup_user.py`.
2. THE Refactor_Tool SHALL rename the class `SysUser` to `SetupUser` within `backend/models/setup_user.py`.
3. THE Refactor_Tool SHALL update `__tablename__` from `'sys_user'` to `'setup_user'` in `backend/models/setup_user.py`.
4. THE Refactor_Tool SHALL update all FK_References from `'sys_user.id'` to `'setup_user.id'` across all Model_Files.
5. THE Refactor_Tool SHALL update all Target_Table_Strings from `'sys_user'` to `'setup_user'` in all Route_Files and Setup_Scripts.

---

### Requirement 2: Rename sys_report_category to setup_report_category

**User Story:** As a backend developer, I want the report category table to use the `setup_` prefix, so that it is clearly identified as master configuration data.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL rename the file `backend/models/sys_report_category.py` to `backend/models/setup_report_category.py`.
2. THE Refactor_Tool SHALL rename the class `SysReportCategory` to `SetupReportCategory` within `backend/models/setup_report_category.py`.
3. THE Refactor_Tool SHALL update `__tablename__` from `'sys_report_category'` to `'setup_report_category'` in `backend/models/setup_report_category.py`.
4. WHEN `SetupReportCategory.get_report_count()` is called, THE SetupReportCategory SHALL query `LedgerReportHeader` (the renamed class) instead of `TransReportHeader`.

---

### Requirement 3: Rename sys_location to setup_location

**User Story:** As a backend developer, I want the location table to use the `setup_` prefix, so that it is clearly identified as master location data.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL rename the file `backend/models/sys_location.py` to `backend/models/setup_location.py`.
2. THE Refactor_Tool SHALL rename the class `SysLocation` to `SetupLocation` within `backend/models/setup_location.py`.
3. THE Refactor_Tool SHALL update `__tablename__` from `'sys_location'` to `'setup_location'` in `backend/models/setup_location.py`.
4. THE Refactor_Tool SHALL update the FK_Reference `db.ForeignKey('sys_user.id')` on the `verified_by` column to `db.ForeignKey('setup_user.id')`.
5. THE Refactor_Tool SHALL update all Target_Table_Strings from `'sys_location'` to `'setup_location'` in `backend/routes/locations.py`.

---

### Requirement 4: Rename sys_help_category to ref_help_category

**User Story:** As a backend developer, I want the help category table to use the `ref_` prefix, so that it is clearly identified as a reference/lookup table.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL rename the file `backend/models/sys_emergency.py` to `backend/models/ref_emergency.py`.
2. THE Refactor_Tool SHALL rename the class `SysHelpCategory` to `RefHelpCategory` within `backend/models/ref_emergency.py`.
3. THE Refactor_Tool SHALL update `__tablename__` from `'sys_help_category'` to `'ref_help_category'` in `backend/models/ref_emergency.py`.
4. THE Refactor_Tool SHALL update the `db.relationship` backref on `RefHelpCategory` to reference `RefHelpContact` (the renamed class).

---

### Requirement 5: Rename sys_help_contact to ref_help_contact

**User Story:** As a backend developer, I want the help contact table to use the `ref_` prefix, so that it is clearly identified as a reference/lookup table.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL rename the class `SysHelpContact` to `RefHelpContact` within `backend/models/ref_emergency.py`.
2. THE Refactor_Tool SHALL update `__tablename__` from `'sys_help_contact'` to `'ref_help_contact'` in `backend/models/ref_emergency.py`.
3. THE Refactor_Tool SHALL update the FK_Reference `db.ForeignKey('sys_help_category.id')` on the `category_id` column to `db.ForeignKey('ref_help_category.id')`.
4. THE Refactor_Tool SHALL update the FK_Reference `db.ForeignKey('sys_user.id')` on the `created_by` column to `db.ForeignKey('setup_user.id')`.
5. THE Refactor_Tool SHALL update all Target_Table_Strings from `'sys_help_contact'` to `'ref_help_contact'` in `backend/routes/help.py`.

---

### Requirement 6: Rename trans_report_header to ledger_report_header

**User Story:** As a backend developer, I want the report header table to use the `ledger_` prefix, so that it is clearly identified as transactional data.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL rename the file `backend/models/trans_report.py` to `backend/models/ledger_report.py`.
2. THE Refactor_Tool SHALL rename the class `TransReportHeader` to `LedgerReportHeader` within `backend/models/ledger_report.py`.
3. THE Refactor_Tool SHALL update `__tablename__` from `'trans_report_header'` to `'ledger_report_header'` in `backend/models/ledger_report.py`.
4. THE Refactor_Tool SHALL update the FK_Reference `db.ForeignKey('sys_user.id')` on the `created_by` column to `db.ForeignKey('setup_user.id')`.
5. THE Refactor_Tool SHALL update the `db.relationship` on `LedgerReportHeader` to reference `LedgerReportEntry` (the renamed class).
6. THE Refactor_Tool SHALL update all Target_Table_Strings from `'trans_report_header'` to `'ledger_report_header'` in all Route_Files.

---

### Requirement 7: Rename trans_report_ledger to ledger_report_entry

**User Story:** As a backend developer, I want the report ledger table to use the `ledger_` prefix with a clearer `_entry` suffix, so that it is clearly identified as individual transactional entries.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL rename the class `TransReportLedger` to `LedgerReportEntry` within `backend/models/ledger_report.py`.
2. THE Refactor_Tool SHALL update `__tablename__` from `'trans_report_ledger'` to `'ledger_report_entry'` in `backend/models/ledger_report.py`.
3. THE Refactor_Tool SHALL update the FK_Reference `db.ForeignKey('trans_report_header.id')` on the `report_header_id` column to `db.ForeignKey('ledger_report_header.id')`.
4. THE Refactor_Tool SHALL update the FK_Reference `db.ForeignKey('sys_user.id')` on the `actor_id` column to `db.ForeignKey('setup_user.id')`.
5. WHEN `LedgerReportHeader.add_ledger_entry()` is called, THE LedgerReportHeader SHALL instantiate `LedgerReportEntry` instead of `TransReportLedger`.

---

### Requirement 8: Preserve sys_audit_log unchanged

**User Story:** As a backend developer, I want the audit log table to remain under the `sys_` prefix, so that system-level infrastructure tables are clearly distinguished.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL leave the file `backend/models/sys_audit.py` with its original filename.
2. THE Refactor_Tool SHALL leave the class name `SysAuditLog` unchanged.
3. THE Refactor_Tool SHALL leave `__tablename__` as `'sys_audit_log'` unchanged.
4. THE Refactor_Tool SHALL update the FK_Reference `db.ForeignKey('sys_user.id')` on the `actor_id` column to `db.ForeignKey('setup_user.id')`.

---

### Requirement 9: Update Init_Module imports and **all**

**User Story:** As a backend developer, I want `backend/models/__init__.py` to reflect all renamed classes and files, so that all route and script imports resolve correctly without modification.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL update all `from models.<old_module> import <OldClass>` statements in `backend/models/__init__.py` to use the new module filenames and class names.
2. THE Refactor_Tool SHALL update the `__all__` list in `backend/models/__init__.py` to contain only the new class names.
3. THE Init_Module SHALL export `SetupUser`, `SetupReportCategory`, `SetupLocation`, `RefHelpCategory`, `RefHelpContact`, `LedgerReportHeader`, `LedgerReportEntry`, and `SysAuditLog`.

---

### Requirement 10: Update all Route_File imports and class references

**User Story:** As a backend developer, I want all route files to import and use the renamed classes, so that the API layer is consistent with the new model naming.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL update `backend/routes/auth.py` to import `SetupUser` (aliased as `User`) and `SysAuditLog` from `models`.
2. THE Refactor_Tool SHALL update `backend/routes/users.py` to import `SetupUser` (aliased as `User`) and `SysAuditLog` from `models`.
3. THE Refactor_Tool SHALL update `backend/routes/reports.py` to import `LedgerReportHeader` (aliased as `Report`), `SetupReportCategory` (aliased as `ReportCategory`), `LedgerReportEntry` (aliased as `ReportLedger`), and `SysAuditLog` from `models`.
4. THE Refactor_Tool SHALL update `backend/routes/locations.py` to import `SetupLocation` (aliased as `Location`) and `SysAuditLog` from `models`.
5. THE Refactor_Tool SHALL update `backend/routes/help.py` to import `RefHelpCategory` (aliased as `HelpCategory`), `RefHelpContact` (aliased as `HelpContact`), and `SysAuditLog` from `models`.
6. WHEN `backend/routes/users.py` references `TransReportHeader` in the `get_user_reports` function, THE Refactor_Tool SHALL replace it with `LedgerReportHeader`.

---

### Requirement 11: Rename Setup_Scripts

**User Story:** As a backend developer, I want the setup scripts to follow the same naming convention as the models they initialize, so that the project structure is consistent.

#### Acceptance Criteria

1. THE Refactor_Tool SHALL rename `backend/set_up_database.py` to `backend/setup_database.py`.
2. THE Refactor_Tool SHALL rename `backend/set_up_emergency_contacts.py` to `backend/setup_emergency_contacts.py`.
3. THE Refactor_Tool SHALL rename `backend/set_up_risk_status.py` to `backend/setup_risk_status.py`.
4. THE Refactor_Tool SHALL update all internal imports within `backend/setup_emergency_contacts.py` to use `RefHelpCategory` and `RefHelpContact` instead of `SysHelpCategory` and `SysHelpContact`.
5. THE Refactor_Tool SHALL update all internal imports within `backend/setup_risk_status.py` to use `SetupReportCategory` instead of `SysReportCategory`.
6. THE Refactor_Tool SHALL update all internal imports within `backend/setup_database.py` to use `SetupUser` instead of `SysUser`.
7. WHEN `backend/set_up_database.py` prints next-step instructions, THE setup_database.py SHALL reference the new script names `setup_emergency_contacts.py` and `setup_risk_status.py`.

---

### Requirement 12: No orphaned old-name references

**User Story:** As a backend developer, I want zero remaining references to old class names, table names, or file names after the refactor, so that the codebase is fully consistent and no runtime errors occur from stale references.

#### Acceptance Criteria

1. WHEN the refactor is complete, THE codebase SHALL contain no string occurrences of `SysUser`, `SysReportCategory`, `SysLocation`, `SysHelpCategory`, `SysHelpContact`, `TransReportHeader`, or `TransReportLedger` outside of comments or documentation.
2. WHEN the refactor is complete, THE codebase SHALL contain no `__tablename__` values of `sys_user`, `sys_report_category`, `sys_location`, `sys_help_category`, `sys_help_contact`, `trans_report_header`, or `trans_report_ledger`.
3. WHEN the refactor is complete, THE codebase SHALL contain no FK_References to `sys_user.id`, `sys_help_category.id`, `trans_report_header.id` in any Model_File.
4. WHEN the refactor is complete, THE codebase SHALL contain no Target_Table_Strings of `sys_user`, `sys_location`, `sys_help_contact`, or `trans_report_header` in any Route_File.
