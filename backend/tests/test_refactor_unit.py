"""
Unit tests for backend-db-naming-refactor spec.
Verifies file existence, tablenames, exports, relationships, and script content.
"""

import sys
import os
from pathlib import Path

# Add backend/ to sys.path so models and app can be imported
BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))

import pytest

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def app():
    """Create Flask app with testing config and push an app context."""
    from app import create_app
    from config import config_by_name
    flask_app = create_app(config_by_name["testing"])
    ctx = flask_app.app_context()
    ctx.push()
    yield flask_app
    ctx.pop()


# ---------------------------------------------------------------------------
# 1. FILE EXISTENCE — new model files exist, old ones do not
# ---------------------------------------------------------------------------

class TestModelFileExistence:
    def test_setup_user_exists(self):
        assert (BACKEND_DIR / "models" / "setup_user.py").exists()

    def test_setup_report_category_exists(self):
        assert (BACKEND_DIR / "models" / "setup_report_category.py").exists()

    def test_setup_location_exists(self):
        assert (BACKEND_DIR / "models" / "setup_location.py").exists()

    def test_ref_emergency_exists(self):
        assert (BACKEND_DIR / "models" / "ref_emergency.py").exists()

    def test_ledger_report_exists(self):
        assert (BACKEND_DIR / "models" / "ledger_report.py").exists()

    def test_sys_audit_exists(self):
        assert (BACKEND_DIR / "models" / "sys_audit.py").exists()

    def test_sys_user_does_not_exist(self):
        assert not (BACKEND_DIR / "models" / "sys_user.py").exists()

    def test_sys_report_category_does_not_exist(self):
        assert not (BACKEND_DIR / "models" / "sys_report_category.py").exists()

    def test_sys_location_does_not_exist(self):
        assert not (BACKEND_DIR / "models" / "sys_location.py").exists()

    def test_sys_emergency_does_not_exist(self):
        assert not (BACKEND_DIR / "models" / "sys_emergency.py").exists()

    def test_trans_report_does_not_exist(self):
        assert not (BACKEND_DIR / "models" / "trans_report.py").exists()


# ---------------------------------------------------------------------------
# 2. SETUP SCRIPT EXISTENCE — new scripts exist, old ones do not
# ---------------------------------------------------------------------------

class TestSetupScriptExistence:
    def test_setup_database_exists(self):
        assert (BACKEND_DIR / "setup_database.py").exists()

    def test_setup_emergency_contacts_exists(self):
        assert (BACKEND_DIR / "setup_emergency_contacts.py").exists()

    def test_setup_risk_status_exists(self):
        assert (BACKEND_DIR / "setup_risk_status.py").exists()

    def test_set_up_database_does_not_exist(self):
        assert not (BACKEND_DIR / "set_up_database.py").exists()

    def test_set_up_emergency_contacts_does_not_exist(self):
        assert not (BACKEND_DIR / "set_up_emergency_contacts.py").exists()

    def test_set_up_risk_status_does_not_exist(self):
        assert not (BACKEND_DIR / "set_up_risk_status.py").exists()


# ---------------------------------------------------------------------------
# 3. __tablename__ VALUES
# ---------------------------------------------------------------------------

class TestTablenames:
    def test_setup_user_tablename(self, app):
        from models.setup_user import SetupUser
        assert SetupUser.__tablename__ == "setup_user"

    def test_setup_report_category_tablename(self, app):
        from models.setup_report_category import SetupReportCategory
        assert SetupReportCategory.__tablename__ == "setup_report_category"

    def test_setup_location_tablename(self, app):
        from models.setup_location import SetupLocation
        assert SetupLocation.__tablename__ == "setup_location"

    def test_ref_help_category_tablename(self, app):
        from models.ref_emergency import RefHelpCategory
        assert RefHelpCategory.__tablename__ == "ref_help_category"

    def test_ref_help_contact_tablename(self, app):
        from models.ref_emergency import RefHelpContact
        assert RefHelpContact.__tablename__ == "ref_help_contact"

    def test_ledger_report_header_tablename(self, app):
        from models.ledger_report import LedgerReportHeader
        assert LedgerReportHeader.__tablename__ == "ledger_report_header"

    def test_ledger_report_entry_tablename(self, app):
        from models.ledger_report import LedgerReportEntry
        assert LedgerReportEntry.__tablename__ == "ledger_report_entry"

    def test_sys_audit_log_tablename(self, app):
        from models.sys_audit import SysAuditLog
        assert SysAuditLog.__tablename__ == "sys_audit_log"


# ---------------------------------------------------------------------------
# 4. models.__init__.py EXPORTS
# ---------------------------------------------------------------------------

class TestModelsExports:
    def test_all_classes_importable_from_models(self, app):
        import models
        expected = [
            "SetupUser",
            "SetupReportCategory",
            "SetupLocation",
            "RefHelpCategory",
            "RefHelpContact",
            "LedgerReportHeader",
            "LedgerReportEntry",
            "SysAuditLog",
        ]
        for name in expected:
            assert hasattr(models, name), f"models.{name} not found"

    def test_all_classes_in_dunder_all(self, app):
        import models
        expected = [
            "SetupUser",
            "SetupReportCategory",
            "SetupLocation",
            "RefHelpCategory",
            "RefHelpContact",
            "LedgerReportHeader",
            "LedgerReportEntry",
            "SysAuditLog",
        ]
        for name in expected:
            assert name in models.__all__, f"{name} missing from models.__all__"


# ---------------------------------------------------------------------------
# 5. RELATIONSHIP TARGETS
# ---------------------------------------------------------------------------

class TestRelationships:
    def test_ref_help_category_contacts_target(self, app):
        from models.ref_emergency import RefHelpCategory, RefHelpContact
        mapper_class = RefHelpCategory.contacts.property.mapper.class_
        assert mapper_class is RefHelpContact

    def test_ledger_report_header_entries_target(self, app):
        from models.ledger_report import LedgerReportHeader, LedgerReportEntry
        mapper_class = LedgerReportHeader.ledger_entries.property.mapper.class_
        assert mapper_class is LedgerReportEntry

    def test_setup_user_reports_target(self, app):
        from models.setup_user import SetupUser
        from models.ledger_report import LedgerReportHeader
        mapper_class = SetupUser.reports.property.mapper.class_
        assert mapper_class is LedgerReportHeader

    def test_setup_user_actions_target(self, app):
        from models.setup_user import SetupUser
        from models.ledger_report import LedgerReportEntry
        mapper_class = SetupUser.actions.property.mapper.class_
        assert mapper_class is LedgerReportEntry


# ---------------------------------------------------------------------------
# 6. add_ledger_entry RETURNS LedgerReportEntry
# ---------------------------------------------------------------------------

class TestAddLedgerEntry:
    def test_add_ledger_entry_returns_ledger_report_entry(self, app):
        from models.ledger_report import LedgerReportHeader, LedgerReportEntry
        header = LedgerReportHeader(
            title="Test Report",
            _description="encrypted_placeholder",
            category="other",
            latitude=6.1164,
            longitude=125.1716,
        )
        entry = header.add_ledger_entry(action="test", status="pending_review")
        assert isinstance(entry, LedgerReportEntry)


# ---------------------------------------------------------------------------
# 7. SETUP SCRIPT CONTENT
# ---------------------------------------------------------------------------

class TestSetupScriptContent:
    def _read(self, filename):
        return (BACKEND_DIR / filename).read_text(encoding="utf-8")

    def test_setup_database_references_emergency_contacts_script(self):
        src = self._read("setup_database.py")
        assert "setup_emergency_contacts.py" in src

    def test_setup_database_references_risk_status_script(self):
        src = self._read("setup_database.py")
        assert "setup_risk_status.py" in src

    def test_setup_database_references_setup_user(self):
        src = self._read("setup_database.py")
        assert "SetupUser" in src

    def test_setup_emergency_contacts_references_ref_help_category(self):
        src = self._read("setup_emergency_contacts.py")
        assert "RefHelpCategory" in src

    def test_setup_emergency_contacts_references_ref_help_contact(self):
        src = self._read("setup_emergency_contacts.py")
        assert "RefHelpContact" in src

    def test_setup_risk_status_references_setup_report_category(self):
        src = self._read("setup_risk_status.py")
        assert "SetupReportCategory" in src
