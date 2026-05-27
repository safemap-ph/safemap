# Requirements Document

## Introduction

This feature refactors the SafeMap-PH Flask backend from a flat `routes/` + `models/` structure into a feature-module architecture. Each domain (auth, users, reports, locations, help, chatbot) becomes a self-contained module under `backend/modules/`, with its own Blueprint, service layer, and DTOs. Shared models remain in `backend/models/`, and shared utilities move from `backend/utils/` to `backend/core/utils.py`. All existing API endpoints, URL paths, and response contracts are preserved without breaking changes.

## Glossary

- **Module**: A self-contained directory under `backend/modules/` representing one domain (e.g., `auth`, `users`, `reports`). Contains `routes.py`, `service.py`, `dto.py`, and `__init__.py`.
- **Blueprint**: A Flask `Blueprint` instance defined per module and registered in `app.py` with a URL prefix.
- **DTO (Data Transfer Object)**: A plain Python dataclass that defines the shape of incoming request data or outgoing response data. Provides `from_request()` and `to_dict()` methods.
- **Service**: A module-level Python file (`service.py`) that contains all business logic for a domain, called by route handlers.
- **Route Handler**: A function in `routes.py` that handles HTTP concerns only — parsing the request, calling the service, and returning a response.
- **Core**: The `backend/core/` package containing shared utilities (JWT helpers, auth decorators, pagination) previously in `backend/utils/`.
- **API Contract**: The set of URL paths, HTTP methods, request shapes, and response shapes currently exposed by the backend.
- **Flat Structure**: The current architecture where all routes live in `backend/routes/` and all models in `backend/models/`.
- **Request DTO**: A DTO that parses and validates incoming JSON request data via `from_request(data: dict)`.
- **Response DTO**: A DTO that serializes model data into a response-safe dict via `to_dict()`.
- **SysAuditLog**: The existing audit logging model in `backend/models/sys_audit.py`, used across modules.
- **SetupUser**: The existing user model in `backend/models/setup_user.py`, aliased as `User` in routes.

---

## Requirements

### Requirement 1: Module Directory Structure

**User Story:** As a backend developer, I want each domain to live in its own module directory, so that I can find and modify domain logic without navigating unrelated files.

#### Acceptance Criteria

1. THE System SHALL create a `backend/modules/` directory containing one subdirectory for each domain: `auth`, `users`, `reports`, `locations`, `help`, and `chatbot`.
2. THE System SHALL ensure each module directory contains exactly four files: `__init__.py`, `routes.py`, `service.py`, and `dto.py`.
3. THE System SHALL create a `backend/core/` directory containing `__init__.py` and `utils.py`.
4. THE System SHALL preserve the `backend/models/` directory and all existing model files without modification.

---

### Requirement 2: Blueprint-per-Module Registration

**User Story:** As a backend developer, I want each module to register its own Flask Blueprint, so that URL routing is self-contained per domain.

#### Acceptance Criteria

1. THE System SHALL define one `Blueprint` instance per module in that module's `routes.py`.
2. WHEN `create_app()` is called, THE Application SHALL register each module Blueprint with a URL prefix of `/api`.
3. THE System SHALL remove the import of the single `api_bp` from `backend/routes/__init__.py` in `app.py` after all module Blueprints are registered.
4. IF a module Blueprint fails to register, THEN THE Application SHALL raise an `ImportError` at startup rather than silently skipping the module.

---

### Requirement 3: Route Handler Responsibility Boundary

**User Story:** As a backend developer, I want route handlers to only handle HTTP concerns, so that business logic is testable independently of Flask.

#### Acceptance Criteria

1. THE Route_Handler SHALL parse the incoming request using the corresponding Request DTO's `from_request()` method.
2. THE Route_Handler SHALL delegate all business logic to the corresponding Service function.
3. THE Route_Handler SHALL serialize the service result using the corresponding Response DTO's `to_dict()` method before returning a JSON response.
4. THE Route_Handler SHALL NOT contain direct database queries, model instantiation, or audit logging calls.

---

### Requirement 4: Service Layer Extraction

**User Story:** As a backend developer, I want all business logic extracted into service functions, so that logic can be unit-tested without HTTP context.

#### Acceptance Criteria

1. THE Service SHALL contain all business logic currently inline in the corresponding route handler, including database queries, model mutations, and audit logging.
2. THE Service function SHALL accept plain Python values or DTO instances as arguments, not Flask `request` objects.
3. THE Service function SHALL return plain Python dicts or model instances, not Flask `Response` objects.
4. WHEN a service operation fails due to a business rule violation (e.g., duplicate username, invalid category), THE Service SHALL raise a domain-specific exception or return an error indicator rather than calling `jsonify`.

---

### Requirement 5: DTO Definition and Validation

**User Story:** As a backend developer, I want DTOs to define and validate all request and response shapes, so that data contracts are explicit and enforced at the boundary.

#### Acceptance Criteria

1. THE System SHALL define each DTO as a Python `dataclass` in the module's `dto.py` file.
2. THE Request_DTO SHALL implement a `from_request(cls, data: dict)` classmethod that extracts and type-coerces fields from the input dict.
3. IF a required field is missing from the input dict, THEN THE Request_DTO's `from_request()` SHALL raise a `KeyError` or `ValueError` with a descriptive message.
4. THE Response_DTO SHALL implement a `to_dict(self)` method that returns a JSON-serializable dict.
5. THE System SHALL define the following DTOs per module:
   - `auth`: `LoginRequestDTO`, `RegisterRequestDTO`, `TokenResponseDTO`
   - `users`: `CreateUserDTO`, `UpdateUserDTO`, `UserResponseDTO`
   - `reports`: `SubmitReportDTO`, `ReportResponseDTO`, `ReportActionDTO`
   - `locations`: `CreateLocationDTO`, `UpdateLocationDTO`, `LocationResponseDTO`
   - `help`: `CreateContactDTO`, `UpdateContactDTO`, `ContactResponseDTO`
   - `chatbot`: `ChatQueryDTO`, `ChatResponseDTO`

---

### Requirement 6: Core Utilities Migration

**User Story:** As a backend developer, I want shared utilities in a dedicated `core/` package, so that all modules import from a single, well-known location.

#### Acceptance Criteria

1. THE System SHALL move all functions from `backend/utils/__init__.py` into `backend/core/utils.py` without changing their signatures or behavior.
2. THE System SHALL update all module imports to reference `core.utils` instead of `utils`.
3. THE System SHALL retain `backend/utils/__init__.py` as an empty file or remove it, but SHALL NOT leave it with the original utility implementations after migration.
4. WHEN `core.utils.require_auth` is applied as a decorator, THE Decorator SHALL behave identically to the original `utils.require_auth` decorator.

---

### Requirement 7: API Contract Preservation

**User Story:** As a frontend developer, I want all existing API endpoints to remain unchanged, so that no frontend code needs to be updated during this refactor.

#### Acceptance Criteria

1. THE System SHALL preserve every existing URL path and HTTP method combination currently defined in `backend/routes/`.
2. THE System SHALL preserve the JSON field names and structure of every existing success response.
3. THE System SHALL preserve the JSON field names and structure of every existing error response.
4. WHEN the refactored backend receives a request that was valid before the refactor, THE System SHALL return the same HTTP status code as before.
5. THE System SHALL preserve all existing authentication and authorization rules (role checks, `require_auth` guards) on every endpoint.

---

### Requirement 8: Old Routes Directory Removal

**User Story:** As a backend developer, I want the old `backend/routes/` directory removed after migration, so that there is no ambiguity about which code is active.

#### Acceptance Criteria

1. WHEN all module Blueprints are registered and all tests pass, THE System SHALL delete the `backend/routes/` directory and all files within it.
2. THE System SHALL remove any import of `routes` or `api_bp` from `backend/app.py` after the migration.
3. IF any file outside `backend/routes/` imports from `backend/routes`, THEN THE System SHALL update that import to reference the appropriate module before deletion.

---

### Requirement 9: Backward-Compatible `models/` Package

**User Story:** As a backend developer, I want the models package to remain unchanged, so that all modules can import shared models without modification.

#### Acceptance Criteria

1. THE System SHALL NOT modify any file in `backend/models/`.
2. THE System SHALL NOT move any model class out of `backend/models/`.
3. WHEN a module service imports a model (e.g., `from models import SetupUser`), THE Import SHALL resolve correctly after the refactor.

---

### Requirement 10: Module `__init__.py` Blueprint Export

**User Story:** As a backend developer, I want each module's `__init__.py` to export its Blueprint, so that `app.py` can register all Blueprints with a uniform import pattern.

#### Acceptance Criteria

1. THE System SHALL define each module's `__init__.py` to import and re-export the module's Blueprint instance.
2. WHEN `app.py` imports a module (e.g., `from modules.auth import auth_bp`), THE Import SHALL succeed without circular import errors.
3. THE System SHALL name each Blueprint consistently: `auth_bp`, `users_bp`, `reports_bp`, `locations_bp`, `help_bp`, `chatbot_bp`.
