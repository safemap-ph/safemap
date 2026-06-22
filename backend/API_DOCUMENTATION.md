# SafeMap-PH API Documentation

This document provides a comprehensive list of all API endpoints, their required inputs, and the underlying database models used.

## Database Model Naming Convention

All system tables and files use the `sys_` prefix, while transaction-related tables use the `trans_` prefix.

| Model | Table Name | Description |
| :--- | :--- | :--- |
| **SysUser** | `sys_user` | User authentication and profile management |
| **SysLocation** | `sys_location` | Safe locations and points of interest |
| **SysHelpCategory** | `sys_help_category` | Emergency category classification |
| **SysHelpContact** | `sys_help_contact` | Emergency hotlines and contacts |
| **SysReportCategory** | `sys_report_category` | Incident classification settings |
| **TransReportHeader** | `trans_report_header` | Incident report primary data (Header) |
| **TransReportLedger** | `trans_report_ledger` | Incident report audit trail and logs (Ledger) |

---

## API Endpoints

### 1. Authentication (`/api/auth`)
**Controller:** `backend/routes/auth.py`

| Method | Endpoint | Description | Inputs (JSON Body) | Database Models |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/login` | User login | `username`, `password` | `SysUser` |
| POST | `/register` | User registration | `username`, `email`, `password`, `full_name` (opt), `phone` (opt), `role` (opt) | `SysUser` |
| POST | `/logout` | User logout | None (Requires Auth) | None |
| POST | `/refresh` | Refresh JWT token | None (Requires Auth) | `SysUser` |

### 2. Reports (`/api/reports`)
**Controller:** `backend/routes/reports.py`

| Method | Endpoint | Description | Inputs (JSON / Query) | Database Models |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/public` | Public heatmap reports | Query: `category`, `city` | `TransReportHeader` |
| GET | `/pending` | Admin review queue | Query: `page`, `per_page` | `TransReportHeader` |
| GET | `/` | All reports (Admin) | Query: `page`, `per_page`, `status`, `category`, `city` | `TransReportHeader` |
| GET | `/<id>` | Single report details | URL Param: `report_id` | `TransReportHeader` |
| GET | `/reference/<ref>` | Get report by ref code | URL Param: `reference_code` | `TransReportHeader` |
| POST | `/submit` | Submit anonymous report | Body: `title`, `description`, `latitude`, `longitude`, `category`, `severity` (opt), `city` (opt), `barangay` (opt), `address` (opt), `image_url` (opt) | `TransReportHeader`, `TransReportLedger` |
| POST | `/<id>/approve` | Approve for awareness | URL Param: `report_id`, Body: `notes` (opt) | `TransReportHeader`, `TransReportLedger` |
| POST | `/<id>/verify` | PNP Verification (sets status to 'verified') | URL Param: `report_id`, Body: `case_number` (opt), `notes` (opt) | `TransReportHeader`, `TransReportLedger` |
| POST | `/<id>/dismiss` | Dismiss report | URL Param: `report_id`, Body: `reason` (opt) | `TransReportHeader`, `TransReportLedger` |
| POST | `/<id>/spam` | Mark as spam | URL Param: `report_id` | `TransReportHeader`, `TransReportLedger` |
| GET | `/stats` | Dashboard statistics | None (Requires Auth) | `TransReportHeader` |
| GET | `/heatmap` | Heatmap data (Admin) | None (Requires Auth) | `TransReportHeader` |
| GET | `/categories` | Get all categories | None | `SysReportCategory` |
| POST | `/categories` | Create category | Body: `name`, `label`, `description` (opt), `priority` (opt) | `SysReportCategory` |
| PUT | `/categories/<id>` | Update category | URL Param: `id`, Body: `name`, `label`, `description`, `priority`, `is_active` (all opt) | `SysReportCategory` |
| DELETE | `/categories/<id>` | Delete category | URL Param: `id` | `SysReportCategory` |

### 3. Locations (`/api/locations`)
**Controller:** `backend/routes/locations.py`

| Method | Endpoint | Description | Inputs (JSON / Query) | Database Models |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | All safe locations | Query: `page`, `per_page`, `type`, `city` | `SysLocation` |
| GET | `/<id>` | Single location details | URL Param: `location_id` | `SysLocation` |
| GET | `/nearby` | Find nearby locations | Query: `latitude`, `longitude`, `radius` (opt) | `SysLocation` |
| POST | `/` | Create new location | Body: `name`, `latitude`, `longitude`, `type`, `address`, `city`, `barangay`, `description`, `facilities`, `operating_hours`, `contact_info`, `is_verified` | `SysLocation` |

### 4. Help Directory (`/api/help`)
**Controller:** `backend/routes/help.py`

| Method | Endpoint | Description | Inputs (JSON / Query) | Database Models |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/categories` | Get help categories | None | `SysHelpCategory` |
| GET | `/contacts` | Get emergency contacts | Query: `category` | `SysHelpContact` |
| GET | `/contacts/<id>` | Single contact details | URL Param: `contact_id` | `SysHelpContact` |
| POST | `/contacts` | Create contact (Admin) | Body: `name`, `category`, `description`, `phone`, `phone_alt`, `email`, `website`, `address`, `latitude`, `longitude`, `operating_hours`, `is_24_7` | `SysHelpCategory`, `SysHelpContact` |

### 5. Users (`/api/users`)
**Controller:** `backend/routes/users.py`

| Method | Endpoint | Description | Inputs (JSON / Query) | Database Models |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | All users (Admin only) | Query: `page`, `per_page` | `SysUser` |
| GET | `/<id>` | User profile details | URL Param: `user_id` | `SysUser` |
| POST | `/` | Create new user (Admin) | Body: `username`, `email`, `password`, `full_name`, `phone`, `role` | `SysUser` |
| PUT | `/<id>` | Update user profile | URL Param: `user_id`, Body: `full_name`, `phone`, `profile_image`, `role`, `is_active`, `is_verified` | `SysUser` |

### 6. Chatbot (`/api/chatbot`)
**Controller:** `backend/routes/chatbot.py`

| Method | Endpoint | Description | Inputs (JSON Body) | Database Models |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/query` | Send query to AI bot | `message`, `context` | None (Uses Help Models for lookup) |
| GET | `/suggestions` | Get workflow prompts | None | None |
| GET | `/history` | Get chat history | None (Requires Auth) | None (Planned) |
| DELETE | `/history` | Clear history | None (Requires Auth) | None (Planned) |


---

## Report Status Values

The system uses the following status values for report lifecycle management:

| Status | Description | Visibility |
| :--- | :--- | :--- |
| `pending_review` | Initial status when report is submitted | Admin only |
| `approved_awareness` | Report approved for public awareness display | Public |
| `verified` | Report verified by PNP (Philippine National Police) | Public |
| `dismissed` | Report dismissed by admin | Admin only |
| `spam` | Report marked as spam | Admin only |

**Status Workflow:**
```
pending_review → approved_awareness → verified
              ↘ dismissed
              ↘ spam
```

**Public Visibility:** Only reports with status `approved_awareness` or `verified` are visible in public endpoints (`/api/reports/public`).
