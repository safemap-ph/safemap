# SafeMap-PH — RAG Knowledge Base

> **Purpose:** This document is the single source of truth for the SafeMap-PH AI Chatbot's Retrieval-Augmented Generation (RAG) pipeline. Every section is structured so the chatbot can retrieve relevant context and answer user queries accurately.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Public User Interaction](#2-public-user-interaction)
3. [AI Chatbot Assistance](#3-ai-chatbot-assistance)
4. [Anonymous Report Submission](#4-anonymous-report-submission)
5. [Hotspot Map & Visualization](#5-hotspot-map--visualization)
6. [Get Help Now — Emergency Hotlines & Stations](#6-get-help-now--emergency-hotlines--stations)
7. [Admin Officer Workflow](#7-admin-officer-workflow)
8. [Help Directory Updates](#8-help-directory-updates)
9. [System Output & Visualization](#9-system-output--visualization)
10. [Report Categories & Severity Levels](#10-report-categories--severity-levels)
11. [Report Status Lifecycle](#11-report-status-lifecycle)
12. [Reference Code Format](#12-reference-code-format)
13. [Safety & Privacy Notices](#13-safety--privacy-notices)
14. [Emergency Contact Directory](#14-emergency-contact-directory)
15. [Local Services Directory (General Santos City)](#15-local-services-directory-general-santos-city)
16. [Frequently Asked Questions (FAQ)](#16-frequently-asked-questions-faq)
17. [Glossary](#17-glossary)

---

## 1. System Overview

**SafeMap-PH** is a community safety mapping platform focused on **General Santos City (GenSan), Philippines**. It enables:

- **Public users** to anonymously report safety incidents, view a hotspot heatmap of approved/verified incidents, access emergency hotlines, and chat with an AI assistant.
- **Admin officers (DWSD staff)** to review, approve, verify, or dismiss reports, manage the help directory, and generate analytics.

### Architecture

| Layer                   | Technology                       | Description                                    |
| ----------------------- | -------------------------------- | ---------------------------------------------- |
| Frontend (Mobile-first) | React + Vite + Leaflet           | Map view, report forms, help page, chat widget |
| Legacy Frontend         | Vanilla HTML/JS modules          | Original map, chatbot, report, admin panels    |
| Backend API             | Python Flask                     | RESTful API with JWT authentication            |
| Database                | SQLite (dev) / PostgreSQL (prod) | Reports, users, help contacts, locations       |
| Authentication          | JWT Bearer tokens                | Access + refresh token flow                    |

### API Base URL

```
http://localhost:5000/api
```

---

## 2. Public User Interaction

A public (unauthenticated) user can perform the following actions without logging in:

### 2.1 Ask the AI Chatbot

- Click the **chat icon** on the bottom navigation bar, or the **AI Chat** quick action on the map screen.
- The chatbot opens as a floating widget.
- Users can ask about: map usage, reporting, hotlines, safety tips, and emergencies.
- Suggested questions are provided (see Section 3).

### 2.2 Submit an Anonymous Report

- Tap **"Report Incident"** (the floating report button) on the main map screen.
- The user is taken through a multi-step flow:
  1. **Safety First** page — read emergency protocol and privacy rules, check both boxes.
  2. **Incident Details** — select incident type, date/time, and description.
  3. **Location Details** — pick location on an interactive map (drop a pin) or enter an address.
  4. **Review & Submit** — review all details, then submit.
  5. **Report Success** — receive a reference code and safety notice.
- Full details of the submission workflow are in Section 4.

### 2.3 View the Hotspot Map

- The main screen displays a Leaflet map centered on General Santos City (lat: 6.1167, lng: 125.1667).
- **Approved (unverified)** reports appear as a **heatmap overlay** (aggregated heat gradient).
- **Verified (PNP Confirmed)** reports appear as **individual markers** with popups showing type, date, and description.
- Users can filter by incident type, verification status, and date range.
- Color legend is accessible via the **Risk Legend** component on the map.

### 2.4 Open "Get Help Now"

- Tap the **shield icon** ("Help") on the bottom navigation bar.
- The Help Page shows:
  - VAWC Support information with the Women and Children Protection Center card.
  - Emergency hotline numbers (VAWC, PNP, WCPD, Emergency).
  - "What to expect when you call" guidance.
  - "Find Nearest WCPD Desk" button for geolocation-based lookup.

### 2.5 Track a Previously Submitted Report

- Navigate to **"Track Report"** from the menu.
- Enter the reference code (format: `SMPH-XXXXXX`).
- View the current status of the report.

---

## 3. AI Chatbot Assistance

The chatbot is a keyword-driven assistant that processes user messages and returns structured responses. It is available to all users without login.

### 3.1 Suggested Questions

When the chatbot opens, it displays these quick-tap suggestions:

| ID                | Suggestion Text                | Icon      |
| ----------------- | ------------------------------ | --------- |
| `how_to_report`   | How do I submit a report?      | clipboard |
| `hotspot_colors`  | What do hotspot colors mean?   | palette   |
| `map_filters`     | How do I use map filters?      | filter    |
| `pnp_contact`     | How do I contact PNP?          | phone     |
| `vawc_contact`    | Where can I find VAWC hotline? | heart     |
| `emergency_help`  | I need emergency help          | alert     |
| `check_reference` | Check my report status         | search    |
| `safety_tips`     | Safety tips                    | shield    |

### 3.2 Topics the Chatbot Can Answer

#### How to Use Map Filters

**Trigger keywords:** `filter`, `filters`, `filtering`, `use map`

**Response:**
To filter the hotspot map:

1. Click the "Filter" button on the map controls.
2. Select incident types you want to see:
   - Theft/Robbery (🔴 Red)
   - Assault (🟠 Orange)
   - Fraud (🔵 Blue)
   - Harassment (🟣 Purple)
   - Accidents (🟡 Yellow)
3. Toggle date range to see recent incidents.
4. You can combine multiple filters at once.

#### What Hotspot Colors Mean

**Trigger keywords:** `color`, `colors`, `hotspot`, `meaning`, `legend`

**Response:**

- 🔴 **RED (Critical/High)** — Serious crimes, verified incidents
- 🟠 **ORANGE (High)** — Assault, violent incidents
- 🟡 **YELLOW (Medium)** — Accidents, minor incidents
- 🔵 **BLUE (Low)** — Fraud, non-violent crimes
- 🟣 **PURPLE** — Harassment cases
- ⚪ **WHITE/GRAY** — Pending review (only visible to admins)

**Verification status indicators:**

- ✅ Verified (PNP Confirmed) — Official records, shown as individual markers
- ⭕ Unverified (Approved) — Under awareness, shown as heatmap aggregation

#### How the Reporting Process Works

**Trigger keywords:** `report`, `reporting`, `submit`, `file report`, `how to report`

**Response:**

1. Click "Report Incident" on the main menu.
2. Fill in details: incident type, description, date/time, and location (click on map or enter address).
3. Click submit — you will receive a reference code.

**Important facts:**

- Reports are **anonymous by default**.
- All submissions are reviewed by admin staff before appearing on the map.
- Users receive a reference code in the format `SMPH-XXXXXX` (e.g., `SMPH-A1B2C3`).
- Use this code to check report status at any time.
- **Safety Notice:** Do not confront suspects directly. In emergencies, dial 911.

#### PNP (Philippine National Police) Contacts

**Trigger keywords:** `pnp`, `police`, `crime`

**Response:**

- **Emergency:** Dial 117 or 911
- **Text PNP:** 0917-847-5757
- **Website:** pnp.gov.ph

**Local PNP stations in General Santos City:**

| Station                    | Contact                  |
| -------------------------- | ------------------------ |
| GSC Police Office          | 552-5573 / 0998-598-7207 |
| Station 1 (Dadiangas East) | 0998-598-7208            |
| Station 2 (Makar Wharf)    | 0918-921-3580            |
| Station 3 (Lagao)          | 0998-598-7212            |
| Station 4 (San Isidro)     | 0998-598-7214            |
| Station 5                  | 0907-313-4517            |
| Station 6 (Bula)           | 0998-598-7218            |
| Station 7 (Fatima)         | 0998-598-7220            |
| Station 8 (Tinagacan)      | 0998-598-7223            |
| Station 9 (Mabuhay)        | 0948-874-1661            |
| Station 10 (Calumpang)     | 0999-548-9244            |

#### WCPD / VAWC Contacts

**Trigger keywords:** `wcpd`, `vawc`, `women`, `children`, `abuse`

**Response:**

- **VAWC Hotline:** 1388 (24/7)
- **WCPD Hotline:** 02-8532-5003
- VAWC desks are available at all local police stations.
- DSWD Social Workers are available for crisis intervention.
- Women Crisis Centers provide shelter and support.
- **All calls and reports are confidential.**

#### DSWD (Department of Social Welfare and Development)

**Trigger keywords:** `dswd`, `welfare`, `social`

**Response:**

- **DSWD Hotline:** 02-8931-8101
- **SWAD Team (NCR):** 0932-529-8293

**Services provided:**

- Crisis intervention
- Temporary shelter
- Financial assistance
- Social case management

#### Fire Emergency

**Trigger keywords:** `fire`, `burning`

**Response:**

- **BFP Emergency:** Dial 117 or 911
- **BFP GenSan:** 552-1160 / 0943-341-5561 / 160

**What to do in case of fire:**

1. Stay calm
2. Alert others
3. Call emergency hotlines
4. Evacuate if safe
5. Don't use elevators
6. Close doors behind you

#### Medical Emergency

**Trigger keywords:** `medical`, `hospital`, `doctor`, `injured`

**Response:**

- **Emergency:** Dial 117 or 911
- **Red Cross:** 143
- Check the "Get Help Now" section on the map for nearest hospitals.

**If someone is injured:**

1. Call for help
2. Don't move injured person unless in danger
3. Apply first aid if trained
4. Stay with them until help arrives

**Hospitals in General Santos City:**

| Hospital                                 | Contact                  |
| ---------------------------------------- | ------------------------ |
| Gensan Medical Center                    | 887-9898                 |
| St. Elizabeth Hospital                   | 552-3162 / 0919-071-9004 |
| Mindanao Medical Center                  | 553-8207 / 554-9640      |
| Dadiangas Medical Center                 | 0917-190-2561            |
| Sarangani Bay Specialists Medical Center | 887-8888 / 0919-067-8395 |
| Gensan Doctors Hospital                  | 250-2777 / 0933-821-7257 |
| Dr. Jorge P. Royeca City Hospital        | 552-2811 / 0912-376-2331 |

#### Immediate Emergency

**Trigger keywords:** `emergency`, `help me`, `danger`, `urgent`, `now`

**Response:**

- **DIAL 911 or 117** (24/7 - All emergencies)
- 🔴 Crime in progress → Police
- 🔥 Fire → Fire Department
- 🚑 Medical → Ambulance
- 👨‍👩‍👧 Child/Women abuse → VAWC 1388

**Stay safe:**

- Move to a safe location if possible
- Don't confront attackers
- Note the location/description
- Call for help immediately

#### Check Report Status

**Trigger keywords:** `reference`, `code`, `check status`, `track`

**Response:**

1. Go to "Track Report" in the menu.
2. Enter your reference code (e.g., `SMPH-A1B2C3`).
3. View your current status.

**Report statuses:**

- ⏳ **Pending Review** — Under admin review
- ✅ **Approved** — Visible on public heatmap
- ✅ **Verified** — PNP confirmed
- ❌ **Dismissed** — Spam/duplicate

#### Safety Tips

**Trigger keywords:** `safety`, `tips`, `advice`, `protect`

**General Safety:**

- Stay aware of your surroundings
- Avoid isolated areas at night
- Keep valuables hidden
- Use well-lit, busy routes
- Trust your instincts

**Online Safety:**

- Don't share personal info
- Verify before trusting
- Report suspicious activity

**In Case of Emergency:**

- Call 911 immediately
- Note your location
- Stay calm

#### Greetings / Help

**Trigger keywords:** `hello`, `hi`, `hey`, `good`, `start`, `help`

The chatbot introduces itself as "SafeMap Assistant" and lists everything it can help with:

- Map Help (how to use filters, what hotspot colors mean)
- Reporting (how to submit a report, check report status)
- Emergency Contacts (PNP, VAWC, DSWD hotlines, Medical & Fire)
- Safety Tips (general safety advice, emergency procedures)

### 3.3 Default / Fallback Response

If the chatbot does not recognize the query, it responds with:

> I can help with: Reporting (how to submit incidents), Map (filters and hotspot colors), Contacts (PNP, VAWC, DSWD, emergency), Safety (tips and advice). Just ask me anything! Or type 'help' to see all options.

---

## 4. Anonymous Report Submission

### 4.1 Submission Flow

```
User taps "Report Incident"
        │
        ▼
┌─────────────────────┐
│  1. Safety First     │  ← Must check Emergency Protocol + Privacy Rule
│     Page             │
└─────────┬───────────┘
          │ Both boxes checked → "Start Anonymous Report"
          ▼
┌─────────────────────┐
│  2. Incident Details │  ← Type, Date/Time, Description
│     Page             │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  3. Location Details │  ← Pin on map or enter address (Barangay, City)
│     Page             │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  4. Review & Submit  │  ← Review all details, confirm submission
│     Page             │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  5. Report Success   │  ← Reference code + safety notice displayed
│     Page             │
└─────────────────────┘
```

### 4.2 Required Fields

| Field         | Type             | Required | Description                                          |
| ------------- | ---------------- | -------- | ---------------------------------------------------- |
| `title`       | String (max 200) | ✅       | Brief title of incident                              |
| `description` | Text             | ✅       | Detailed description (min 10 characters)             |
| `latitude`    | Float            | ✅       | Location latitude                                    |
| `longitude`   | Float            | ✅       | Location longitude                                   |
| `category`    | String           | ✅       | Must be one of the valid categories (see Section 10) |

### 4.3 Optional Fields

| Field              | Type   | Description                                        |
| ------------------ | ------ | -------------------------------------------------- |
| `severity`         | String | `low`, `medium` (default), `high`, `critical`      |
| `barangay`         | String | Barangay name                                      |
| `address`          | String | Street address                                     |
| `reporter_name`    | String | Optional — marks report as having personal details |
| `reporter_contact` | String | Optional — will be removed by admin during review  |
| `image_url`        | String | URL to attached image                              |

### 4.4 What Happens After Submission

1. **Validation:** System checks all required fields are present and valid.
   - If fields are missing → returns error with list of missing fields.
   - If category is invalid → returns error with valid categories list.
2. **Safety Check:** The system runs basic safety checks:
   - Description must be at least 10 characters.
   - Coordinates must be within the Philippines (Lat: 4.5–21.0, Lng: 116.0–127.0).
3. **Save:** Report is saved to the anonymous database with:
   - Status: `pending_review` (Unverified & Pending Review)
   - `is_anonymous: true`
4. **Reference Code:** A unique reference code is generated in format `SMPH-XXXXXX` (e.g., `SMPH-A1B2C3`).
5. **Response to User:**
   - Reference code for tracking
   - Status: `pending_review`
   - Safety check result: `passed` or `needs_review`
   - Safety notice: _"Your report has been submitted and is pending review. Do not confront any suspects directly. In case of emergency, dial 911. Save your reference code for tracking."_

### 4.5 API Endpoint

```
POST /api/reports/submit
Content-Type: application/json
No authentication required

Request Body:
{
  "title": "Bag snatching near market",
  "description": "Two individuals on a motorcycle snatched a bag...",
  "latitude": 6.1164,
  "longitude": 125.1716,
  "category": "theft",
  "severity": "high",
  "barangay": "Dadiangas East",
  "address": "Pioneer Avenue"
}

Response (201):
{
  "message": "Report submitted successfully",
  "reference_code": "SMPH-A1B2C3",
  "status": "pending_review",
  "safety_check": "passed",
  "safety_notice": "Your report has been submitted..."
}
```

### 4.6 Tracking a Report

```
GET /api/reports/reference/{reference_code}

Response (200):
{
  "id": 1,
  "title": "Bag snatching near market",
  "status": "pending_review",
  "reference_code": "SMPH-A1B2C3",
  "category": "theft",
  ...
}
```

---

## 5. Hotspot Map & Visualization

### 5.1 Map Details

- **Map provider:** OpenStreetMap via Leaflet.js
- **Center:** General Santos City (lat: 6.1167, lng: 125.1667)
- **Default zoom:** 12

### 5.2 Two Display Layers

| Layer       | Data Source                                              | Visual                                                      |
| ----------- | -------------------------------------------------------- | ----------------------------------------------------------- |
| **Heatmap** | Reports with status `in_progress` (unverified, approved) | Gradient overlay — blue → amber → red based on density      |
| **Markers** | Reports with status `verified` (PNP Confirmed)           | Individual map markers with popup (type, date, description) |

### 5.3 Heatmap Gradient

```
0.2 → #0ea5e9 (Sky blue) — Low density
0.5 → #f59e0b (Amber) — Medium density
0.8 → #ef4444 (Red) — High density
```

**Configuration:** radius: 24px, blur: 16px, maxZoom: 17

### 5.4 Filters

Users can filter the map by:

| Filter            | Options                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| **Incident Type** | Theft, Assault, Fraud, Harassment, Vandalism, Accident, Fire, Flood, Suspicious, Violence, Other |
| **Status**        | Pending, Approved (Unverified), Verified, Dismissed                                              |
| **Date Range**    | From date, To date                                                                               |

**API endpoint for public reports:**

```
GET /api/reports/public?category={category}&city={city}
```

Only returns reports with status `in_progress` or `verified`.

---

## 6. Get Help Now — Emergency Hotlines & Stations

### 6.1 Key National Emergency Numbers

| Service                | Number        | Available |
| ---------------------- | ------------- | --------- |
| **National Emergency** | **911**       | 24/7      |
| **PNP Emergency**      | **117**       | 24/7      |
| **VAWC Hotline**       | **1388**      | 24/7      |
| **Red Cross**          | **143**       | 24/7      |
| **BFP (Fire)**         | **160**       | 24/7      |
| **PNP Text**           | 0917-847-5757 | 24/7      |
| **DSWD Hotline**       | 02-8931-8101  | 24/7      |
| **WCPD Hotline**       | 02-8532-5003  | 24/7      |
| **NDRRMC**             | 02-8911-5061  | 24/7      |

### 6.2 Help Categories in the System

| Category ID | Full Name                            | Icon     |
| ----------- | ------------------------------------ | -------- |
| `pnp`       | Philippine National Police           | police   |
| `wcpd`      | Women and Children Protection Center | shield   |
| `vawc`      | Violence Against Women and Children  | heart    |
| `dswd`      | Department of Social Welfare         | people   |
| `fire`      | Bureau of Fire Protection            | fire     |
| `medical`   | Medical Emergency                    | hospital |
| `disaster`  | Disaster Response                    | alert    |
| `emergency` | General Emergency                    | warning  |

### 6.3 "What to Expect When You Call" (VAWC)

1. You will be connected to a trained female officer or social worker who specializes in VAWC cases.
2. Your conversation is strictly confidential and your identity will be protected.
3. They will provide immediate safety guidance, legal advice, or dispatch help if needed.

### 6.4 API Endpoints

```
GET /api/help/contacts                — All active contacts
GET /api/help/contacts?category=pnp   — Contacts by category
GET /api/help/emergency               — Key emergency contacts (pnp, emergency, medical, fire, vawc)
GET /api/help/search?q={query}        — Search contacts by name/description
GET /api/help/categories              — All help categories
```

---

## 7. Admin Officer Workflow

### 7.1 Authentication

Admin officers (DWSD staff) must log in with username and password.

```
POST /api/auth/login
Body: { "username": "...", "password": "..." }
Response: { "access_token": "...", "refresh_token": "...", "user": {...} }
```

All admin endpoints require a `Bearer` token in the `Authorization` header.

**User roles:** `user`, `moderator`, `admin`

- Only `admin` and `moderator` roles can access report management endpoints.

### 7.2 Pending Reports Queue

```
GET /api/reports/pending?page=1&per_page=20
```

Returns reports with status `pending_review`, including private details (reporter name, contact) for review.

### 7.3 Review Actions

For each pending report, the admin can:

#### A. Approve for Awareness

- Report appears on the **public heatmap** as aggregated heat.
- Personal details are **automatically removed** for privacy.

```
POST /api/reports/{id}/approve
Body: { "notes": "Approved after review" }
→ Sets status to: in_progress
```

#### B. Verify / PNP Confirmed

- Report appears as a **verified marker** on the map.
- Included in **official dashboards** and analytics.
- Personal details are **automatically removed**.

```
POST /api/reports/{id}/verify
Body: { "case_number": "PNP-2026-001", "notes": "Confirmed by PNP" }
→ Sets status to: verified
→ Sets is_pnp_verified to: true
```

#### C. Dismiss (Spam / Duplicate)

- Report is removed from public view.
- Personal details are **automatically removed**.

```
POST /api/reports/{id}/dismiss
Body: { "reason": "Duplicate report" }
→ Sets status to: dismissed
```

#### D. Remove Personal Details

Manually strip any personal information from a report.

```
POST /api/reports/{id}/remove-personal
→ Clears reporter_name, reporter_contact
→ Sets has_personal_details to false
```

### 7.4 All Reports View

```
GET /api/reports?status={status}&category={category}&city={city}&page=1&per_page=20
```

Admins can filter by status, category, and city. Includes private details in the response.

### 7.5 Statistics & Analytics

```
GET /api/reports/stats

Response:
{
  "total": 150,
  "public_visible": 80,
  "pnp_verified": 25,
  "pending_review": 45,
  "by_status": { "pending_review": 45, "in_progress": 55, "verified": 25, "dismissed": 25 },
  "by_category": { "theft": 40, "assault": 30, ... },
  "by_severity": { "low": 20, "medium": 80, "high": 40, "critical": 10 }
}
```

### 7.6 Audit / Activity Log

The admin panel displays a live activity log showing recent actions (report submissions, status changes) with timestamps.

### 7.7 Category Management

```
GET /api/reports/categories
→ Returns list of all valid report categories
```

---

## 8. Help Directory Updates

Authorized staff (admin or moderator) can manage emergency contacts and hotline information.

### 8.1 Create a New Contact

```
POST /api/help/contacts
Authorization: Bearer {token}
Body: {
  "name": "New VAWC Center",
  "category": "vawc",
  "phone": "0912-345-6789",
  "description": "VAWC Center in Barangay Lagao",
  "address": "Lagao, General Santos City",
  "latitude": 6.1205,
  "longitude": 125.1685,
  "is_24_7": true
}
```

### 8.2 Update an Existing Contact

```
PUT /api/help/contacts/{id}
Authorization: Bearer {token}
Body: { "phone": "0912-000-0000", "is_active": true }
```

Updatable fields: `name`, `description`, `phone`, `phone_alt`, `email`, `website`, `address`, `latitude`, `longitude`, `operating_hours`, `is_24_7`, `is_active`, `is_verified`, `category`.

### 8.3 Delete a Contact

```
DELETE /api/help/contacts/{id}
Authorization: Bearer {token}
```

### 8.4 Seed Default Contacts

First-time setup to populate the database with default emergency contacts:

```
POST /api/help/seed
Authorization: Bearer {token} (admin only)
```

### 8.5 Impact of Updates

- Updated contacts appear in the **Help Page** for public users.
- The **AI chatbot** uses the help contact database when responding to queries about PNP, VAWC, DSWD, etc.

---

## 9. System Output & Visualization

### 9.1 Public Users See

| Component            | What It Shows                                            |
| -------------------- | -------------------------------------------------------- |
| **Hotspot Heatmap**  | Aggregated heat overlay of approved (unverified) reports |
| **Verified Markers** | Individual pins for PNP-confirmed incidents              |
| **Risk Legend**      | Color-coded severity guide                               |
| **Help Page**        | Emergency hotlines, WCPD info, nearest station finder    |
| **Chat Widget**      | AI-powered Q&A for map help, reporting, contacts, safety |
| **Report Tracker**   | Status lookup by reference code                          |

### 9.2 Admins See

| Component                  | What It Shows                                 |
| -------------------------- | --------------------------------------------- |
| **Pending Queue**          | All reports awaiting review with full details |
| **All Reports**            | Filterable table of all reports (any status)  |
| **Statistics Dashboard**   | Counts by status, category, severity          |
| **Activity Log**           | Real-time log of system actions               |
| **User Management**        | List/edit/delete system users                 |
| **Help Directory Manager** | CRUD for emergency contacts and hotlines      |

### 9.3 AI Chatbot Availability

The chatbot is available on every screen to public users and provides contextual responses based on keyword matching. It does not require authentication.

---

## 10. Report Categories & Severity Levels

### Categories

| Value        | Display Name        | Map Color |
| ------------ | ------------------- | --------- |
| `theft`      | Theft / Robbery     | 🔴 Red    |
| `assault`    | Physical Assault    | 🟠 Orange |
| `fraud`      | Scam / Fraud        | 🔵 Blue   |
| `harassment` | Harassment          | 🟣 Purple |
| `vandalism`  | Vandalism           | 🟡 Yellow |
| `accident`   | Traffic / Accident  | 🟡 Yellow |
| `fire`       | Fire Incident       | 🟠 Orange |
| `flood`      | Flooding            | 🔵 Blue   |
| `suspicious` | Suspicious Activity | 🟡 Yellow |
| `violence`   | Violence            | 🔴 Red    |
| `other`      | Other               | ⚪ Gray   |

### Severity Levels

| Level      | Description                                          |
| ---------- | ---------------------------------------------------- |
| `low`      | Minor incident, no immediate danger                  |
| `medium`   | Moderate concern (default)                           |
| `high`     | Serious incident requiring attention                 |
| `critical` | Severe/life-threatening, requires immediate response |

---

## 11. Report Status Lifecycle

```
┌──────────────┐
│   Submitted   │
│  (by public)  │
└──────┬───────┘
       ▼
┌──────────────────┐
│  pending_review   │  ← Default status after submission
│  (Unverified &    │     Visible only to admins
│   Pending Review) │
└──────┬───────────┘
       │
       ├─────────────────────────────────────┐
       ▼                                     ▼
┌──────────────────┐              ┌──────────────────┐
│ in_progress      │              │    dismissed      │
│ (Approved for     │              │ (Spam/Duplicate)  │
│  Awareness)       │              │ Removed from      │
│                   │              │ public view       │
│ Shows on PUBLIC   │              └──────────────────┘
│ HEATMAP           │
└──────┬───────────┘
       │ (if PNP confirms)
       ▼
┌──────────────────┐
│    verified       │
│ (PNP Confirmed)  │
│                   │
│ Shows as VERIFIED │
│ MARKER + included │
│ in official       │
│ dashboards        │
└──────────────────┘
```

**Key rules:**

- Only `in_progress` and `verified` reports are visible to the public.
- Personal details are automatically removed when a report is approved, verified, or dismissed.
- Admin review is recorded with `reviewed_by` (user ID), `review_notes`, and `review_date`.
- Verified reports also record `pnp_case_number` and `verified_date`.

---

## 12. Reference Code Format

- **Format:** `SMPH-XXXXXX` where `XXXXXX` is a random 6-character hex string (uppercase).
- **Example:** `SMPH-A1B2C3`, `SMPH-7F3E9D`
- **Purpose:** Allows anonymous users to track their report status without an account.
- **Lookup endpoint:** `GET /api/reports/reference/{code}`

---

## 13. Safety & Privacy Notices

### Safety Notice (shown after submission)

> Your report has been submitted and is pending review. Do not confront any suspects directly. In case of emergency, dial 911. Save your reference code for tracking.

### Privacy Commitments

- Reports are **anonymous by default** (`is_anonymous: true`).
- If a user voluntarily provides their name or contact, it is flagged as `has_personal_details: true`.
- Admin officers **must remove personal details** before approving a report for public view.
- The system **automatically removes** personal details during approve/verify/dismiss actions.
- Reporter name and contact information are **never** shown to the public.

### Pre-Submission Checkboxes

Before starting a report, users must confirm:

1. **Emergency Protocol:** "If you are in immediate danger, call 911 immediately."
2. **Privacy Rule:** "Your report will be treated with strict confidentiality. We never share your personal information."

---

## 14. Emergency Contact Directory

### National Emergency Contacts (Database Defaults)

| Name             | Category  | Phone         | Description                                             | 24/7 |
| ---------------- | --------- | ------------- | ------------------------------------------------------- | ---- |
| Emergency 911    | emergency | 911           | National Emergency Hotline                              | ✅   |
| PNP Hotline      | pnp       | 117           | National Emergency Hotline                              | ✅   |
| PNP Crime Report | pnp       | 0917-847-5757 | Text PNP                                                | ✅   |
| WCPD Hotline     | wcpd      | 02-8532-5003  | Women and Children Protection Center                    | ✅   |
| VAWC Hotline     | vawc      | 1388          | Violence Against Women and Children                     | ✅   |
| DSWD Hotline     | dswd      | 02-8931-8101  | Dept. of Social Welfare and Development                 | ✅   |
| DSWD SWAD        | dswd      | 0932-529-8293 | SWAD Team - NCR                                         | ✅   |
| BFP Hotline      | fire      | 117           | Bureau of Fire Protection Emergency                     | ✅   |
| Red Cross        | medical   | 143           | Philippine Red Cross Emergency                          | ✅   |
| Medical City     | medical   | 02-8988-1000  | The Medical City Hospital                               | ❌   |
| NDRRMC           | disaster  | 02-8911-5061  | National Disaster Risk Reduction and Management Council | ✅   |

---

## 15. Local Services Directory (General Santos City)

### 15.1 Hospitals

| Name                                     | Latitude | Longitude | Contact                  |
| ---------------------------------------- | -------- | --------- | ------------------------ |
| Gensan Medical Center                    | 6.1164   | 125.1716  | 887-9898                 |
| St. Elizabeth Hospital                   | 6.1128   | 125.1710  | 552-3162 / 0919-071-9004 |
| Mindanao Medical Center                  | 6.1105   | 125.1745  | 553-8207 / 554-9640      |
| Dadiangas Medical Center                 | 6.1150   | 125.1685  | 0917-190-2561            |
| Sarangani Bay Specialists Medical Center | 6.1180   | 125.1650  | 887-8888 / 0919-067-8395 |
| Gensan Doctors Hospital                  | 6.1135   | 125.1735  | 250-2777 / 0933-821-7257 |
| Dr. Jorge P. Royeca City Hospital        | 6.1200   | 125.1680  | 552-2811 / 0912-376-2331 |

### 15.2 Police Stations

| Name                              | Latitude | Longitude | Contact                  |
| --------------------------------- | -------- | --------- | ------------------------ |
| GSC Police Office                 | 6.1120   | 125.1715  | 552-5573 / 0998-598-7207 |
| Police Station 1 (Dadiangas East) | 6.1185   | 125.1760  | 0998-598-7208            |
| Police Station 2 (Makar Wharf)    | 6.0945   | 125.1805  | 0918-921-3580            |
| Police Station 3 (Lagao)          | 6.1205   | 125.1685  | 0998-598-7212            |
| Police Station 4 (San Isidro)     | 6.1300   | 125.1850  | 0998-598-7214            |
| Police Station 5                  | 6.1000   | 125.1600  | 0907-313-4517            |
| Police Station 6 (Bula)           | 6.1350   | 125.1605  | 0998-598-7218            |
| Police Station 7 (Fatima)         | 6.1255   | 125.1720  | 0998-598-7220            |
| Police Station 8 (Tinagacan)      | 6.2000   | 125.0500  | 0998-598-7223            |
| Police Station 9 (Mabuhay)        | 6.1400   | 125.1400  | 0948-874-1661            |
| Police Station 10 (Calumpang)     | 6.1050   | 125.1850  | 0999-548-9244            |

### 15.3 Fire & Rescue

| Name                            | Type   | Latitude | Longitude | Contact                        |
| ------------------------------- | ------ | -------- | --------- | ------------------------------ |
| Bureau of Fire Protection (BFP) | Fire   | 6.1130   | 125.1700  | 552-1160 / 0943-341-5561 / 160 |
| CDRRMO Gensan                   | Rescue | 6.1125   | 125.1695  | 552-3939 / 0943-461-4548       |
| Task Force Gensan               | Rescue | 6.1135   | 125.1725  | 887-6018 / 0905-144-3676       |

---

## 16. Frequently Asked Questions (FAQ)

### For Public Users

**Q: Is my report really anonymous?**
A: Yes. Reports are anonymous by default. Even if you provide your name or contact, admin officers are required to remove personal details before the report is made public.

**Q: How do I track my report?**
A: Go to "Track Report" in the app and enter the reference code you received after submission (format: `SMPH-XXXXXX`).

**Q: What does "Pending Review" mean?**
A: Your report has been received and is waiting for an admin officer to review it. It is not yet visible on the public map.

**Q: Why can't I see my report on the map?**
A: Only reports that have been approved or verified by an admin officer appear on the public map. Pending and dismissed reports are not shown.

**Q: What is the difference between "Approved" and "Verified"?**
A: Approved reports appear as a heatmap (aggregated heat overlay) for general awareness. Verified reports have been confirmed by PNP and appear as individual markers on the map, plus they are included in official statistics.

**Q: What should I do in an emergency?**
A: Call **911** immediately. Do not use this app for emergencies that need immediate response. You can also call the PNP at **117** or text **0917-847-5757**.

**Q: How do I find the nearest police station or hospital?**
A: Open the "Get Help Now" section from the bottom navigation bar. You can tap "Find Nearest WCPD Desk" for the closest station, or check the map for nearby hospital and police markers.

**Q: Can I submit a report for someone else?**
A: Yes, you can submit a report on behalf of someone else. Ensure you include accurate details about the incident.

**Q: What types of incidents can I report?**
A: You can report: Theft/Robbery, Assault, Fraud/Scam, Harassment, Vandalism, Accidents, Fire, Flooding, Suspicious Activity, Violence, and Other incidents.

### For Admin Officers

**Q: How do I log in to the admin panel?**
A: Use your DWSD credentials to log in at the admin section. You will need a valid username and password.

**Q: Can I undo a dismissed report?**
A: The status can be changed manually through the database, but the current admin panel does not provide an "un-dismiss" button. Contact the system administrator.

**Q: Are my review actions logged?**
A: Yes. Every approve, verify, and dismiss action is logged with your user ID, timestamp, and notes.

---

## 17. Glossary

| Term                     | Definition                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **BFP**                  | Bureau of Fire Protection                                                                                                   |
| **CDRRMO**               | City Disaster Risk Reduction and Management Office                                                                          |
| **DSWD**                 | Department of Social Welfare and Development                                                                                |
| **DWSD**                 | Division for the Welfare of the Differently Abled (Authorized admin officers)                                               |
| **GenSan**               | General Santos City, South Cotabato, Philippines                                                                            |
| **Heatmap**              | A map overlay showing areas of high incident density using color gradients                                                  |
| **Hotspot**              | An area on the map with a high concentration of reported incidents                                                          |
| **JWT**                  | JSON Web Token — used for authentication                                                                                    |
| **NDRRMC**               | National Disaster Risk Reduction and Management Council                                                                     |
| **PNP**                  | Philippine National Police                                                                                                  |
| **RAG**                  | Retrieval-Augmented Generation — an AI technique where the chatbot retrieves relevant knowledge before generating responses |
| **Reference Code**       | A unique code (SMPH-XXXXXX) given to users after submitting a report, used for tracking                                     |
| **SafeMap-PH**           | The community safety mapping platform for the Philippines                                                                   |
| **SWAD**                 | Social Welfare and Development                                                                                              |
| **VAWC**                 | Violence Against Women and Children                                                                                         |
| **WCPD**                 | Women and Children Protection Desk                                                                                          |
| **Verified**             | A report confirmed by PNP with an official case number                                                                      |
| **Approved (Awareness)** | A report reviewed and approved by admin for public heatmap display, but not officially confirmed by PNP                     |
