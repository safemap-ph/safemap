"""
SafeMap-PH OTP Route
Sends a one-time password via WhatsApp using dbuddyz.prismswift.com (free OTP service).
The recipient must have WhatsApp — this confirms the number is real and reachable.

Setup:
  1. Sign up at https://dbuddyz.prismswift.com
  2. Copy your token from the dashboard
  3. Add to your .env:  DBUDDYZ_TOKEN=your_token_here
"""

import os
import random
import time
import hashlib
import re
import requests
from flask import request, jsonify
from routes import api_bp

DBUDDYZ_API_URL = "https://dbuddyz.prismswift.com/send/"
DBUDDYZ_TOKEN = os.getenv("DBUDDYZ_TOKEN", "")

OTP_EXPIRY_SECONDS = 300   # 5 minutes
OTP_MAX_ATTEMPTS   = 5
OTP_COOLDOWN       = 60    # seconds between resend requests

# In-memory OTP store: { phone_hash: { code, expires, attempts, sent_at } }
# For multi-worker production, replace with Redis.
_otp_store: dict = {}


def _hash_phone(phone: str) -> str:
    return hashlib.sha256(phone.strip().encode()).hexdigest()


def _generate_otp() -> str:
    return str(random.SystemRandom().randint(100000, 999999))


def _normalize_phone(phone: str) -> str:
    """Convert 09XXXXXXXXX → +639XXXXXXXXX (international format for dbuddyz)."""
    phone = phone.strip().replace(" ", "").replace("-", "")
    if phone.startswith("09") and len(phone) == 11:
        return "+63" + phone[1:]
    if phone.startswith("63") and not phone.startswith("+"):
        return "+" + phone
    return phone


@api_bp.route("/otp/send", methods=["POST"])
def send_otp():
    """
    POST /api/otp/send
    Body: { "phone": "09171234567" }
    Generates a 6-digit OTP and delivers it via WhatsApp through dbuddyz.
    """
    data = request.get_json(silent=True) or {}
    phone = data.get("phone", "").strip()

    if not phone:
        return jsonify({"error": "Phone number is required"}), 400

    normalized = _normalize_phone(phone)

    if not re.match(r"^\+639\d{9}$", normalized):
        return jsonify({"error": "Invalid Philippine mobile number (e.g. 09171234567)"}), 400

    if not DBUDDYZ_TOKEN:
        return jsonify({"error": "OTP service is not configured (missing DBUDDYZ_TOKEN)"}), 503

    phone_hash = _hash_phone(normalized)
    now = time.time()

    # Enforce cooldown
    existing = _otp_store.get(phone_hash)
    if existing:
        last_sent = existing.get("sent_at", 0)
        if now - last_sent < OTP_COOLDOWN:
            remaining = int(OTP_COOLDOWN - (now - last_sent))
            return jsonify({
                "error": f"Please wait {remaining}s before requesting another OTP"
            }), 429

    code = _generate_otp()

    # Debug: confirm token is loaded and number is normalized correctly
    print(f"[DEBUG] Token loaded: '{DBUDDYZ_TOKEN[:6]}...' | Sending to: {normalized}")

    # Send via dbuddyz WhatsApp OTP service
    try:
        resp = requests.post(
            DBUDDYZ_API_URL,
            data={
                "token":    DBUDDYZ_TOKEN,
                "otp":      code,
                "tonumber": normalized,
            },
            timeout=10,
        )
        resp.raise_for_status()
    except requests.exceptions.Timeout:
        return jsonify({"error": "OTP service timed out. Please try again."}), 504
    except requests.exceptions.RequestException as e:
        print(f"[OTP ERROR] {type(e).__name__}: {e}")
        if hasattr(e, "response") and e.response is not None:
            print(f"[OTP ERROR] Status: {e.response.status_code} | Body: {e.response.text}")
        return jsonify({"error": "Failed to send OTP. Please try again."}), 502

    # Store hashed entry
    _otp_store[phone_hash] = {
        "code":     code,
        "expires":  now + OTP_EXPIRY_SECONDS,
        "attempts": 0,
        "sent_at":  now,
    }

    return jsonify({
        "message": "OTP sent via WhatsApp",
        "expires_in": OTP_EXPIRY_SECONDS,
    }), 200


@api_bp.route("/otp/verify", methods=["POST"])
def verify_otp():
    """
    POST /api/otp/verify
    Body: { "phone": "09171234567", "code": "123456" }
    Returns { "verified": true } on success.
    """
    data = request.get_json(silent=True) or {}
    phone = data.get("phone", "").strip()
    code  = data.get("code", "").strip()

    if not phone or not code:
        return jsonify({"error": "Phone and code are required"}), 400

    normalized  = _normalize_phone(phone)
    phone_hash  = _hash_phone(normalized)
    now         = time.time()

    entry = _otp_store.get(phone_hash)

    if not entry:
        return jsonify({"error": "No OTP found for this number. Please request a new one."}), 404

    if now > entry["expires"]:
        del _otp_store[phone_hash]
        return jsonify({"error": "OTP has expired. Please request a new one."}), 410

    entry["attempts"] += 1

    if entry["attempts"] > OTP_MAX_ATTEMPTS:
        del _otp_store[phone_hash]
        return jsonify({"error": "Too many incorrect attempts. Please request a new OTP."}), 429

    if code != entry["code"]:
        remaining = OTP_MAX_ATTEMPTS - entry["attempts"]
        return jsonify({
            "error": f"Incorrect OTP. {remaining} attempt(s) remaining."
        }), 400

    # Success — remove so it can't be reused
    del _otp_store[phone_hash]
    return jsonify({"verified": True}), 200