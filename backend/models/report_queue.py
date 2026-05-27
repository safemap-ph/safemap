"""
SafeMap-PH Report Processing Queue Model
Tracks review workflow for incident reports
"""

from models import db
from datetime import datetime


class ReportQueue(db.Model):
    """Queue table for report processing workflow"""

    __tablename__ = "queue"

    id = db.Column(db.Integer, primary_key=True)
    report_header_id = db.Column(
        db.Integer,
        db.ForeignKey("ledger_report_header.id"),
        nullable=False,
        unique=True,
    )

    status = db.Column(db.String(30), default="pending_review", index=True)
    priority = db.Column(db.String(20), default="medium")
    assigned_to = db.Column(db.Integer, db.ForeignKey("setup_user.id"))
    notes = db.Column(db.Text)

    queued_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "report_header_id": self.report_header_id,
            "status": self.status,
            "priority": self.priority,
            "assigned_to": self.assigned_to,
            "notes": self.notes,
            "queued_at": self.queued_at.isoformat() if self.queued_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
