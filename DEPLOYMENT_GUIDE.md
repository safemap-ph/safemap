# SafeMap PH Deployment Guide

This guide will walk you through deploying the SafeMap PH system to production.

## Prerequisites

- **Backend**: Python 3.8+, pip
- **Frontend**: Node.js 18+, npm/pnpm/yarn
- **Database**: SQLite (default) or PostgreSQL

---

## Local Development Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
copy .env.example .env
# Linux/Mac:
cp .env.example .env

# Edit .env with your configuration
```

### 2. Initialize Database

```bash
# Run the database initialization script
python init_db.py
```

### 3. Start Backend Server

```bash
# Development mode
python run.py

# Or using Flask CLI
flask run --host=0.0.0.0 --port=5000
```

The backend will be available at `http://localhost:5000`

### 4. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (using pnpm recommended)
pnpm install

# Start development server
pnpm dev
```

The frontend will be available at `http://localhost:5173`

---

## Production Deployment

### Option A: Traditional Server Deployment

#### Backend (Python/Flask with Gunicorn)

1. **Install production dependencies**:

```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment variables**:
   Create a `.env` file with the following **required** variables:

```env
# Flask Configuration
FLASK_ENV=production

# Security Keys (REQUIRED - must be unique and secure)
SECRET_KEY=your-secure-secret-key-min-32-chars
JWT_SECRET_KEY=your-secure-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-secure-encryption-key-base64-encoded

# Admin Account (REQUIRED for initial setup)
ADMIN_PASSWORD=your-secure-admin-password

# Database Configuration
DATABASE_URL=sqlite:///samapph.db

# Server Configuration
PORT=5000
LOG_LEVEL=INFO

# Security Settings (Production)
FORCE_HTTPS=true
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Important Security Notes:**

- `SECRET_KEY` and `JWT_SECRET_KEY` must be at least 32 characters long and cryptographically random
- `ENCRYPTION_KEY` must be a valid Fernet key (generate using: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`)
- `ADMIN_PASSWORD` must be at least 8 characters with uppercase, lowercase, and numbers
- Never commit `.env` files to version control
- The application will fail to start in production mode if required secrets are missing or use default values

3. **Run with Gunicorn**:

```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

#### Frontend (React/Vite)

1. **Build the application**:

```bash
cd frontend
pnpm install
pnpm build
```

2. **Serve static files**:
   You can use any static file server (Nginx, Apache, or serve):

```bash
# Using serve
npx serve dist -l 3000
```

### Option B: Docker Deployment

1. **Create Dockerfile for Backend**:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
```

2. **Create Dockerfile for Frontend**:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package.json frontend/pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install
COPY frontend/ .
RUN pnpm build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

3. **Create docker-compose.yml**:

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "80:80"
```

4. **Run Docker**:

```bash
docker-compose up -d
```

### Option C: Cloud Platform Deployment

#### Render.com (Recommended for Free Tier)

1. **Backend**:
   - Connect your GitHub repository
   - Build command: `cd backend && pip install -r requirements.txt`
   - Start command: `gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"`
   - Add environment variables in Render dashboard

2. **Frontend**:
   - Create a static site
   - Build command: `cd frontend && pnpm install && pnpm build`
   - Publish directory: `frontend/dist`

#### Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Initialize: `railway init`
3. Add PostgreSQL plugin for production database
4. Deploy with `railway up`

#### Vercel (Frontend) + Render/Railway (Backend)

1. **Frontend on Vercel**:
   - Connect GitHub repo to Vercel
   - Framework preset: Vite
   - Build command: `pnpm build`
   - Output directory: `dist`

2. **Backend on Render/Railway**:
   - Deploy Flask API
   - Update frontend API URL in environment

---

## Production Checklist

### Security

- [ ] Change `SECRET_KEY` to a secure random string
- [ ] Change `JWT_SECRET_KEY` to a secure random string
- [ ] Update CORS origins in `config.py` to your production domain
- [ ] Enable HTTPS/SSL

### Database

- [ ] Use PostgreSQL for production (recommended)
- [ ] Set up regular database backups
- [ ] Configure connection pooling

### Environment Variables

Required production variables:

```env
# Flask Configuration
FLASK_ENV=production

# Security Keys (REQUIRED)
SECRET_KEY=<generate-secure-key-min-32-chars>
JWT_SECRET_KEY=<generate-secure-key-min-32-chars>
ENCRYPTION_KEY=<generate-fernet-key-base64>

# Admin Account (REQUIRED for initial setup)
ADMIN_PASSWORD=<secure-password-min-8-chars>

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:5432/safemap

# Server Configuration
PORT=5000
LOG_LEVEL=WARNING

# Security Settings
FORCE_HTTPS=true
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting (Optional)
RATELIMIT_STORAGE_URL=redis://localhost:6379
```

**How to Generate Secure Keys:**

```bash
# Generate SECRET_KEY and JWT_SECRET_KEY (32+ characters)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate ENCRYPTION_KEY (Fernet key)
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### Reverse Proxy (Nginx Example)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (React)
    location / {
        root /var/www/safemap/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend (Flask API)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Default Admin Account

After running `init_db.py`, a default admin account is created:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default admin password immediately after first login!

---

## Troubleshooting

### Backend Issues

1. **Database errors**: Ensure database file has proper permissions
2. **Port already in use**: Change PORT in .env or stop other services
3. **Module not found**: Ensure all dependencies are installed

### Frontend Issues

1. **API connection errors**: Verify backend URL in development
2. **Build errors**: Clear node_modules and reinstall dependencies

### Common Solutions

```bash
# Clear Python cache
find . -type d -name "__pycache__" -exec rm -rf {} +

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Reset database
rm safemap.db
python init_db.py
```

---

## Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Vite React Guide](https://vitejs.dev/guide/)
- [Leaflet.js Docs](https://leafletjs.com/)

---

## Database Migrations

### Status Naming Migration (verified_pnp → verified)

As part of the backend security refactor, the report status naming has been simplified from `verified_pnp` to `verified` for consistency.

#### When to Run This Migration

Run this migration if you have existing data in your database with the old `verified_pnp` status. This migration should be run:

- After deploying the updated backend code
- Before the application starts serving traffic with the new status naming

#### Pre-Migration Steps

1. **Backup your database**:

```bash
# For SQLite
cp safemap.db safemap.db.backup

# For PostgreSQL
pg_dump -U username -d safemap > safemap_backup.sql
```

2. **Stop the application** to prevent data inconsistency during migration

#### Running the Migration

```bash
# Navigate to backend directory
cd safemap/backend

# Activate virtual environment (if using one)
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Run the migration script
python migrations/migrate_verified_status.py
```

#### Expected Output

The migration script will display:

- Number of records updated in `ledger_report_header` table
- Number of records updated in `ledger_report_entry` table
- Verification that no old `verified_pnp` status values remain
- Current count of records with the new `verified` status

Example output:

```
Starting migration: verified_pnp -> verified
--------------------------------------------------

1. Updating ledger_report_header...
   Updated 15 records in ledger_report_header

2. Updating ledger_report_entry...
   Updated 30 records in ledger_report_entry

--------------------------------------------------
Migration completed successfully!
Total records updated: 45

Summary:
  - ledger_report_header: 15 records
  - ledger_report_entry: 30 records

--------------------------------------------------
Verification:
✓ No 'verified_pnp' status values remaining in database

Current 'verified' status counts:
  - ledger_report_header: 15 records
  - ledger_report_entry: 30 records
```

#### Post-Migration Steps

1. **Verify the migration**:

```bash
# Check that no old status values remain
sqlite3 safemap.db "SELECT COUNT(*) FROM ledger_report_header WHERE status = 'verified_pnp';"
# Should return 0

# Check new status values exist
sqlite3 safemap.db "SELECT COUNT(*) FROM ledger_report_header WHERE status = 'verified';"
# Should return the number of migrated records
```

2. **Test the application**:
   - Start the backend server
   - Verify that reports with verified status display correctly
   - Test the verify report endpoint
   - Check that public reports query includes verified reports

3. **Restart the application** to serve traffic with the new status naming

#### Rollback (If Needed)

If you need to rollback the migration (revert to `verified_pnp`):

```bash
# Navigate to backend directory
cd safemap/backend

# Run the migration script with rollback flag
python migrations/migrate_verified_status.py --rollback
```

You will be prompted to confirm the rollback:

```
⚠️  WARNING: You are about to rollback the migration!
This will revert 'verified' status back to 'verified_pnp'

Are you sure you want to continue? (yes/no):
```

Type `yes` to proceed with the rollback.

**Note**: Only rollback if you need to revert to an older version of the code that uses `verified_pnp`. After rollback, you must also revert the backend code changes.

#### Manual Rollback (Alternative)

If the rollback script fails, you can manually revert using SQL:

```sql
-- For SQLite
sqlite3 safemap.db

-- For PostgreSQL
psql -U username -d safemap

-- Run these SQL commands
UPDATE ledger_report_header SET status = 'verified_pnp' WHERE status = 'verified';
UPDATE ledger_report_entry SET status_to = 'verified_pnp' WHERE status_to = 'verified';

-- Verify the rollback
SELECT COUNT(*) FROM ledger_report_header WHERE status = 'verified_pnp';
SELECT COUNT(*) FROM ledger_report_entry WHERE status_to = 'verified_pnp';
```

#### Troubleshooting

**Migration fails with "No module named 'app'"**:

- Ensure you're in the `safemap/backend` directory
- Ensure your virtual environment is activated
- Ensure all dependencies are installed: `pip install -r requirements.txt`

**Migration fails with database connection error**:

- Check that your `.env` file has correct database configuration
- Ensure the database file exists (for SQLite)
- Ensure database server is running (for PostgreSQL)

**Migration shows 0 records updated**:

- This is normal if you don't have any existing data with `verified_pnp` status
- The migration is safe to run multiple times (idempotent)

**Application shows errors after migration**:

- Verify the backend code has been updated to use `verified` status
- Check application logs for specific error messages
- Ensure the migration completed successfully (check verification output)

---

## Security Best Practices

### Environment Configuration

#### Required Environment Variables

The following environment variables are **mandatory** for production deployment:

| Variable         | Purpose                       | Requirements                           | Example                                                                                     |
| :--------------- | :---------------------------- | :------------------------------------- | :------------------------------------------------------------------------------------------ |
| `SECRET_KEY`     | Flask session encryption      | Min 32 chars, cryptographically random | `python -c "import secrets; print(secrets.token_urlsafe(32))"`                              |
| `JWT_SECRET_KEY` | JWT token signing             | Min 32 chars, cryptographically random | `python -c "import secrets; print(secrets.token_urlsafe(32))"`                              |
| `ENCRYPTION_KEY` | Report description encryption | Valid Fernet key (base64)              | `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `ADMIN_PASSWORD` | Initial admin account         | Min 8 chars, mixed case + numbers      | Set via environment or interactive prompt                                                   |

**Critical:** The application will refuse to start in production mode (`FLASK_ENV=production`) if any of these variables are missing or contain default/insecure values.

#### Optional Security Variables

| Variable       | Purpose                      | Default                                       | Recommended                        |
| :------------- | :--------------------------- | :-------------------------------------------- | :--------------------------------- |
| `FORCE_HTTPS`  | Redirect HTTP to HTTPS       | `false`                                       | `true` in production               |
| `CORS_ORIGINS` | Allowed cross-origin domains | `http://localhost:3000,http://localhost:5173` | Your production domain(s)          |
| `FLASK_ENV`    | Environment mode             | `development`                                 | `production`                       |
| `LOG_LEVEL`    | Logging verbosity            | `INFO`                                        | `WARNING` or `ERROR` in production |

### HTTPS and Transport Security

#### Enable HTTPS Enforcement

Set the following in your production `.env`:

```env
FORCE_HTTPS=true
```

This will:

- Redirect all HTTP requests to HTTPS
- Set secure cookie flags (`Secure`, `HttpOnly`, `SameSite=Lax`)
- Prevent session hijacking over insecure connections

#### Reverse Proxy Configuration

If using Nginx or Apache as a reverse proxy, ensure proper headers are forwarded:

**Nginx Example:**

```nginx
location /api {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### CORS Configuration

#### Restrict Allowed Origins

Update `CORS_ORIGINS` to include only your production domains:

```env
CORS_ORIGINS=https://safemap.example.com,https://www.safemap.example.com
```

**Never use `*` (wildcard) in production** - this allows any website to make authenticated requests on behalf of users.

### Rate Limiting

The application enforces rate limiting on public endpoints to prevent abuse:

| Endpoint                        | Rate Limit         | Purpose                            |
| :------------------------------ | :----------------- | :--------------------------------- |
| `/api/reports/submit`           | 10 requests/minute | Prevent spam report submissions    |
| `/api/reports/public`           | 30 requests/minute | Prevent excessive heatmap queries  |
| `/api/reports/reference/<code>` | 30 requests/minute | Prevent reference code enumeration |

#### Configure Rate Limit Storage

For production deployments with multiple workers, use Redis for rate limit storage:

```env
RATELIMIT_STORAGE_URL=redis://localhost:6379
```

Without Redis, rate limits are stored in memory (not shared across workers).

### Input Validation and Sanitization

The application automatically validates and sanitizes user inputs:

- **Coordinate Validation:** Latitude (4.5-21.0), Longitude (116.0-127.0) for Philippines bounds
- **HTML Sanitization:** All text inputs are stripped of HTML tags to prevent XSS attacks
- **SQL Injection Prevention:** SQLAlchemy ORM with parameterized queries
- **Null/Empty Checks:** Required fields validated before database operations
- **Pagination Limits:** Maximum 100 items per page enforced

### Database Security

#### Use PostgreSQL in Production

While SQLite works for development, use PostgreSQL for production:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/safemap
```

Benefits:

- Better concurrency handling
- Row-level locking
- Full ACID compliance
- Better performance at scale

#### Database Backups

Set up automated daily backups:

**PostgreSQL:**

```bash
# Add to crontab
0 2 * * * pg_dump -U username safemap > /backups/safemap_$(date +\%Y\%m\%d).sql
```

**SQLite:**

```bash
# Add to crontab
0 2 * * * cp /path/to/safemap.db /backups/safemap_$(date +\%Y\%m\%d).db
```

### Encryption Key Management

#### Encryption Key Rotation

If you need to rotate the `ENCRYPTION_KEY`:

1. **Backup the database** before rotation
2. Decrypt all existing report descriptions with the old key
3. Re-encrypt with the new key
4. Update the `ENCRYPTION_KEY` environment variable

**Note:** Changing the encryption key without migrating data will make existing encrypted descriptions unreadable.

#### Key Storage

- **Never commit keys to version control**
- Use environment variables or secret management services (AWS Secrets Manager, HashiCorp Vault)
- Restrict file permissions on `.env` files: `chmod 600 .env`

### Admin Account Security

#### Change Default Password

After initial deployment, immediately change the admin password:

1. Log in with the initial admin credentials
2. Navigate to user profile settings
3. Update password to a strong, unique password
4. Consider using a password manager

#### Password Requirements

Admin passwords must meet the following requirements:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Recommended: Include special characters

### Logging and Monitoring

#### Configure Structured Logging

The application uses structured logging with the following levels:

- `DEBUG`: Detailed diagnostic information (development only)
- `INFO`: General informational messages
- `WARNING`: Warning messages for potential issues
- `ERROR`: Error messages for failures

Set appropriate log level in production:

```env
LOG_LEVEL=WARNING
```

#### Monitor Error Logs

Key events that are logged:

- Failed authentication attempts
- Rate limit violations
- Input validation failures
- Decryption errors
- 404 and 500 errors with request context

Review logs regularly for security incidents.

### Security Checklist

Before deploying to production, verify:

- [ ] All required environment variables are set with secure values
- [ ] `FLASK_ENV=production` is set
- [ ] `FORCE_HTTPS=true` is enabled
- [ ] `CORS_ORIGINS` contains only your production domains (no `*`)
- [ ] Admin password has been changed from default
- [ ] Database backups are configured and tested
- [ ] HTTPS/SSL certificate is valid and configured
- [ ] Rate limiting is enabled and tested
- [ ] Logs are being collected and monitored
- [ ] `.env` file permissions are restricted (`chmod 600`)
- [ ] Application starts successfully with production configuration
- [ ] All secrets are stored securely (not in version control)

### Incident Response

If you suspect a security breach:

1. **Immediately rotate all secrets:**
   - Generate new `SECRET_KEY`, `JWT_SECRET_KEY`, `ENCRYPTION_KEY`
   - Update environment variables
   - Restart the application

2. **Invalidate all active sessions:**
   - All users will need to log in again with new JWT tokens

3. **Review audit logs:**
   - Check `sys_audit` table for suspicious activity
   - Review application logs for unauthorized access attempts

4. **Restore from backup if necessary:**
   - Use the most recent clean backup
   - Re-apply any legitimate changes made after backup

### Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web application security risks
- [Flask Security Best Practices](https://flask.palletsprojects.com/en/latest/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Python Cryptography Documentation](https://cryptography.io/)
