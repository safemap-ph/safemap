"""
SafeMap-PH Notifications API Routes
Provide near-real-time admin notifications feed.
"""

from flask import request, jsonify
from sqlalchemy.orm import joinedload

from routes import api_bp
from models import LedgerReportEntry, SysAuditLog
from utils import require_auth


def _format_category(value):
    if not value:
        return "Unassigned"
    return str(value).replace("_", " ").title()


def _format_location(report):
    parts = [report.barangay, report.city]
    parts = [p for p in parts if p]
    return ", ".join(parts) if parts else "Unknown"


def _build_report_notification(entry):
    report = entry.header
    status = entry.status_to or report.status
    severity = report.severity or "medium"
    category_label = _format_category(report.category)
    location = _format_location(report)

    if status in ["pending_review"]:
        title = "New report submitted"
    elif status in ["in_progress"]:
        title = "Report in progress"
    elif status in ["verified", "verified_pnp"]:
        title = "Report verified"
    elif status in ["dismissed", "false_report", "spam"]:
        title = "Report closed"
    else:
        title = "Report updated"

    desc = f"{category_label} report in {location}."

    return {
        "id": f"report-{entry.id}",
        "source": "report",
        "title": title,
        "desc": desc,
        "created_at": entry.created_at,
        "severity": severity,
        "status": status,
        "report_id": report.id,
    }


def _build_audit_notification(entry):
    action_label = str(entry.action or "activity").replace("_", " ").title()
    category_label = str(entry.category or "system").replace("_", " ").title()
    title = f"{category_label} update"
    desc = action_label

    if entry.target_table and entry.target_id:
        desc = f"{action_label} on {entry.target_table} #{entry.target_id}"

    return {
        "id": f"audit-{entry.id}",
        "source": "audit",
        "title": title,
        "desc": desc,
        "created_at": entry.created_at,
        "severity": "info",
        "status": entry.action,
    }


@api_bp.route("/notifications", methods=["GET"])
@require_auth
def get_notifications():
    """Get recent admin notifications."""
    limit = min(request.args.get("limit", 20, type=int), 100)
    audit_limit = min(request.args.get("audit_limit", 10, type=int), 100)
    include_audit = request.args.get("include_audit", "true").lower() == "true"

    report_entries = (
        LedgerReportEntry.query.options(joinedload(LedgerReportEntry.header))
        .order_by(LedgerReportEntry.created_at.desc())
        .limit(limit)
        .all()
    )

    notifications = [_build_report_notification(entry) for entry in report_entries if entry.header]

    if include_audit:
        audit_entries = (
            SysAuditLog.query.order_by(SysAuditLog.created_at.desc()).limit(audit_limit).all()
        )
        notifications.extend([_build_audit_notification(entry) for entry in audit_entries])

    notifications = sorted(notifications, key=lambda item: item["created_at"], reverse=True)

    response = []
    for item in notifications:
        payload = {**item}
        payload["created_at"] = (
            item["created_at"].isoformat() if item.get("created_at") is not None else None
        )
        response.append(payload)

    return jsonify({"notifications": response, "total": len(response)}), 200
