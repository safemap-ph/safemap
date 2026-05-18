# Implementation Plan: Backend DB Naming Refactor

## Overview

Rename model files, class names, `__tablename__` values, FK references, relationship strings, route imports, audit log `target_table` strings, and setup scripts in the SafeMap-PH Flask/SQLAlchemy backend. Changes follow the design's prescribed order: model files first, then `__init__.py`, then routes, then setup scripts, then tests.

## Tasks

- [x] 1. Rename and rewrite `backend/models/sys_user.py` → `backend/models/setup_user.py`
  - Create `backend/models/setup_user.py` with class `SetupUser` (renamed from `SysUser`)
  - Set `__tablename__ = 'setup_user'`
  - Update relationship strings: `'TransReportHeader'` → `'LedgerReportHeader'`, `'TransReportLedger'` → `'LedgerReportEntry'`
  - Delete `backend/models/sys_user.py`
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Rename and rewrite `backend/models/sys_report_category.py` → `backend/models/setup_report_category.py`
  - Create `backend/models/setup_report_category.py` with class `SetupReportCategory`
  - Set `__tablename__ = 'setup_report_category'`
  - Update `get_report_count()` to import and query `LedgerReportHeader` instead of `TransReportHeader`
  - Delete `backend/models/sys_report_category.py`
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Rename and rewrite `backend/models/sys_location.py` → `backend/models/setup_location.py`
  - Create `backend/models/setup_location.py` with class `SetupLocation`
  - Set `__tablename__ = 'setup_location'`
  - Update FK on `verified_by`: `'sys_user.id'` → `'setup_user.id'`
  - Delete `backend/models/sys_location.py`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Rename and rewrite `backend/models/sys_emergency.py` → `backend/models/ref_emergency.py`
  - Create `backend/models/ref_emergency.py` with classes `RefHelpCategory` and `RefHelpContact`
  - Set `RefHelpCategory.__tablename__ = 'ref_help_category'`
  - Set `RefHelpContact.__tablename__ = 'ref_help_contact'`
  - Update `RefHelpCategory.contacts` relationship string: `'SysHelpContact'` → `'RefHelpContact'`
  - Update FK on `RefHelpContact.category_id`: `'sys_help_category.id'` → `'ref_help_category.id'`
  - Update FK on `RefHelpContact.created_by`: `'sys_user.id'` → `'setup_user.id'`
  - Delete `backend/models/sys_emergency.py`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

- [x] 5. Rename and rewrite `backend/models/trans_report.py` → `backend/models/ledger_report.py`
  - Create `backend/models/ledger_report.py` with classes `LedgerReportHeader` and `LedgerReportEntry`
  - Set `LedgerReportHeader.__tablename__ = 'ledger_report_header'`
  - Set `LedgerReportEntry.__tablename__ = 'ledger_report_entry'`
  - Update FK on `LedgerReportHeader.created_by`: `'sys_user.id'` → `'setup_user.id'`
  - Update `LedgerReportHeader.ledger_entries` relationship string: `'TransReportLedger'` → `'LedgerReportEntry'`
  - Update `LedgerReportHeader.add_ledger_entry()` to instantiate `LedgerReportEntry` instead of `TransReportLedger`
  - Update FK on `LedgerReportEntry.report_header_id`: `'trans_report_header.id'` → `'ledger_report_header.id'`
  - Update FK on `LedgerReportEntry.actor_id`: `'sys_user.id'` → `'setup_user.id'`
  - Update `to_dict(include_private=True)` ledger ordering reference from `TransReportLedger` to `LedgerReportEntry`
  - Delete `backend/models/trans_report.py`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. Update `backend/models/sys_audit.py` FK reference
  - Update FK on `SysAuditLog.actor_id`: `'sys_user.id'` → `'setup_user.id'`
  - Leave filename, class name, and `__tablename__` unchanged
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7. Rewrite `backend/models/__init__.py`
  - Replace all old `from models.<old_module> import <OldClass>` statements with new module/class names
  - Export: `SetupUser`, `SetupReportCategory`, `SetupLocation`, `RefHelpCategory`, `RefHelpContact`, `LedgerReportHeader`, `LedgerReportEntry`, `SysAuditLog`
  - Update `__all__` to contain only the new class names (plus `db`)
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 8. Update `backend/routes/auth.py`
  - Change import: `SysUser as User` → `SetupUser as User`
  - Update all `target_table='sys_user'` → `target_table='setup_user'` in `SysAuditLog.log(...)` calls
  - _Requirements: 1.5, 10.1_

- [x] 9. Update `backend/routes/users.py`
  - Change import: `SysUser as User` → `SetupUser as User`
  - Update inline import in `get_user_reports`: `TransReportHeader as Report` → `LedgerReportHeader as Report`
  - Update all `target_table='sys_user'` → `target_table='setup_user'` in `SysAuditLog.log(...)` calls
  - _Requirements: 1.5, 10.2, 10.6_

- [x] 10. Update `backend/routes/reports.py`
  - Change imports: `TransReportHeader as Report` → `LedgerReportHeader as Report`, `SysReportCategory as ReportCategory` → `SetupReportCategory as ReportCategory`, `TransReportLedger as ReportLedger` → `LedgerReportEntry as ReportLedger`
  - Update all `target_table='trans_report_header'` → `target_table='ledger_report_header'` in `SysAuditLog.log(...)` calls
  - _Requirements: 6.6, 10.3_

- [x] 11. Update `backend/routes/locations.py`
  - Change import: `SysLocation as Location` → `SetupLocation as Location`
  - Update all `target_table='sys_location'` → `target_table='setup_location'` in `SysAuditLog.log(...)` calls
  - _Requirements: 3.5, 10.4_

- [x] 12. Update `backend/routes/help.py`
  - Change imports: `SysHelpCategory as HelpCategory` → `RefHelpCategory as HelpCategory`, `SysHelpContact as HelpContact` → `RefHelpContact as HelpContact`
  - Update all `target_table='sys_help_contact'` → `target_table='ref_help_contact'` in `SysAuditLog.log(...)` calls
  - _Requirements: 5.5, 10.5_

- [x] 13. Checkpoint — verify no old names remain in model and route files
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Rename and update setup scripts
  - [x] 14.1 Create `backend/setup_database.py` from `backend/set_up_database.py`
    - Replace `from models import SysUser` → `from models import SetupUser`
    - Replace all `SysUser(` → `SetupUser(`
    - Replace all `SysUser.query` → `SetupUser.query`
    - Update print statements: `'set_up_emergency_contacts.py'` → `'setup_emergency_contacts.py'`, `'set_up_risk_status.py'` → `'setup_risk_status.py'`
    - Delete `backend/set_up_database.py`
    - _Requirements: 11.1, 11.6, 11.7_

  - [x] 14.2 Create `backend/setup_emergency_contacts.py` from `backend/set_up_emergency_contacts.py`
    - Replace `from models import SysHelpCategory, SysHelpContact` → `from models import RefHelpCategory, RefHelpContact`
    - Replace all `SysHelpCategory(` → `RefHelpCategory(`, `SysHelpContact(` → `RefHelpContact(`, `SysHelpContact.query` → `RefHelpContact.query`
    - Delete `backend/set_up_emergency_contacts.py`
    - _Requirements: 11.2, 11.4_

  - [x] 14.3 Create `backend/setup_risk_status.py` from `backend/set_up_risk_status.py`
    - Replace `from models import SysReportCategory` → `from models import SetupReportCategory`
    - Replace all `SysReportCategory(` → `SetupReportCategory(`, `SysReportCategory.query` → `SetupReportCategory.query`
    - Delete `backend/set_up_risk_status.py`
    - _Requirements: 11.3, 11.5_

- [-] 15. Write unit tests verifying file existence, `__tablename__` values, `__init__.py` exports, relationships, and setup script contents
  - [x] 15.1 Create `backend/tests/test_refactor_unit.py`
    - Assert new model files exist and old ones do not (`setup_user.py`, `setup_report_category.py`, `setup_location.py`, `ref_emergency.py`, `ledger_report.py`, `sys_audit.py`; old files absent)
    - Assert new setup scripts exist and old ones do not
    - Assert each class `__tablename__` matches the new value (requires Flask app context)
    - Assert all new class names are importable from `models` and present in `models.__all__`
    - Assert `RefHelpCategory.contacts` relationship targets `RefHelpContact`
    - Assert `LedgerReportHeader.ledger_entries` relationship targets `LedgerReportEntry`
    - Assert `SetupUser.reports` relationship targets `LedgerReportHeader`
    - Assert `SetupUser.actions` relationship targets `LedgerReportEntry`
    - Assert `LedgerReportHeader.add_ledger_entry(...)` returns a `LedgerReportEntry` instance
    - Assert `setup_database.py` source contains `'setup_emergency_contacts.py'` and `'setup_risk_status.py'`
    - Assert `setup_emergency_contacts.py` source imports `RefHelpCategory` and `RefHelpContact`
    - Assert `setup_risk_status.py` source imports `SetupReportCategory`
    - _Requirements: 1.1–1.3, 2.1–2.4, 3.1–3.3, 4.1–4.3, 5.1–5.2, 6.1–6.3, 7.1–7.2, 8.1–8.3, 9.1–9.3, 11.1–11.7_

- [ ] 16. Write property-based tests for the four correctness properties
  - [ ]\* 16.1 Write property test for Property 1 — no old class names in any backend Python source file
    - Use `hypothesis` `@given(filepath=st.sampled_from(...))` over all `backend/**/*.py` files
    - Strip comments/docstrings before scanning; assert none of `SysUser`, `SysReportCategory`, `SysLocation`, `SysHelpCategory`, `SysHelpContact`, `TransReportHeader`, `TransReportLedger` appear
    - Tag: `# Feature: backend-db-naming-refactor, Property 1: No old class names remain in any backend Python source file`
    - **Property 1: No old class names remain in any backend Python source file**
    - **Validates: Requirements 1.2, 2.2, 3.2, 4.2, 5.1, 6.2, 7.1, 10.1–10.6, 12.1**

  - [ ]\* 16.2 Write property test for Property 2 — no old `__tablename__` values in any model class
    - Use `hypothesis` `@given(model_class=st.sampled_from(all_model_classes()))` where `all_model_classes()` imports all classes from `models`
    - Assert `model_class.__tablename__` is not in the set of old table names
    - Tag: `# Feature: backend-db-naming-refactor, Property 2: No old __tablename__ values exist in any model class`
    - **Property 2: No old `__tablename__` values exist in any model class**
    - **Validates: Requirements 1.3, 2.3, 3.3, 4.3, 5.2, 6.3, 7.2, 12.2**

  - [ ]\* 16.3 Write property test for Property 3 — no old FK strings in any model file
    - Use `hypothesis` `@given(filepath=st.sampled_from(...))` over all `backend/models/*.py` files
    - Assert none of `'sys_user.id'`, `'sys_help_category.id'`, `'trans_report_header.id'`, `'sys_location.id'` appear in file text
    - Tag: `# Feature: backend-db-naming-refactor, Property 3: No old foreign key reference strings remain in any model file`
    - **Property 3: No old foreign key reference strings remain in any model file**
    - **Validates: Requirements 1.4, 3.4, 5.3, 5.4, 6.4, 7.3, 7.4, 8.4, 12.3**

  - [ ]\* 16.4 Write property test for Property 4 — no old `target_table` strings in any route file
    - Use `hypothesis` `@given(filepath=st.sampled_from(...))` over all `backend/routes/*.py` files
    - Assert none of `'sys_user'`, `'sys_location'`, `'sys_help_contact'`, `'trans_report_header'` appear in file text
    - Tag: `# Feature: backend-db-naming-refactor, Property 4: No old target_table strings remain in any route file`
    - **Property 4: No old `target_table` strings remain in any route file**
    - **Validates: Requirements 1.5, 3.5, 5.5, 6.6, 12.4**

- [ ] 17. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Tasks 1–6 must be completed before task 7 (`__init__.py`), which must be complete before tasks 8–12 (routes)
- Tasks 14.1–14.3 depend on tasks 1–7 being complete so the new class names are importable
- `sys_audit.py` filename and class name are intentionally unchanged; only the FK string changes (task 6)
- Property tests require `hypothesis` to be installed (`pip install hypothesis`)
- Unit tests that check `__tablename__` or relationships require an active Flask app context
