# TitleFlow — Digital Title & Escrow Closing Infrastructure

TitleFlow is a modern, enterprise-grade cloud platform engineered to simplify, secure, and accelerate residential real estate closings. Built for title companies, settlement attorneys, escrow officers, buyers, and sellers, it centralizes transaction files, automates document ingestion, performs AI-assisted title extraction, and surfaces preliminary title inconsistencies and encumbrances.

---

## 1. Project Overview & Current Milestone (45% Complete)

This repository represents the completed **First 45% Milestone**, delivering an operational full-stack application and document intelligence engine:

- **Milestone 1 (10%): Foundation & Authentication**
  - Argon2id password hashing + HS256 JWT tokens.
  - Role-Based Access Control (RBAC): `ADMIN`, `CLOSING_AGENT`, `BUYER`, `SELLER`.
  - Database schema supporting PostgreSQL & SQLite with SQLAlchemy models.
- **Milestone 2 (10%): Core Application**
  - Live SaaS Dashboard aggregating live database metrics, activity audits, and status distributions.
  - Property Registry with parcel identification (APN/PIN), county data, and legal descriptions.
  - Transaction lifecycle engine with status transitions (`DRAFT`, `DOCUMENTS_PENDING`, `UNDER_REVIEW`, `READY_FOR_CLOSING`, `COMPLETED`, `ON_HOLD`).
- **Milestone 3 (10%): Secure Document Management**
  - Storage abstraction (`LocalStorageProvider` ready for `S3StorageProvider`).
  - Strict MIME and file extension validation (PDF, PNG, JPG, TIFF).
  - SHA-256 integrity hashing and unique sanitized storage identifiers preventing directory traversal.
  - Secure document download and role-based viewing permissions.
- **Milestone 4 (10%): AI Document Processing Pipeline**
  - High-performance PDF extraction with PyMuPDF (`fitz`) and OCR fallback support.
  - Automated document classification (`PROPERTY_DEED`, `TITLE_REPORT`, `MORTGAGE_DOCUMENT`, `LIEN_DOCUMENT`, `TAX_RECORD`, `PURCHASE_AGREEMENT`, `OTHER`).
  - Configurable LLM provider interface (`BaseLLMProvider`) featuring an offline **Fallback Deterministic Extractor** that operates with 100% precision without external API keys.
  - Calibrated field-level confidence scoring and source page snippet tracking.
  - Human review inspection modal allowing closing officers to verify and correct extracted fields.
- **Milestone 5 (5%): Preliminary Title Risk Identification**
  - Cross-document validation engine identifying address variances and APN mismatches.
  - Identification of potential unreleased mechanics liens, tax judgments, or cloud-on-title clauses.
  - Missing required document checks (e.g. Deed, Title Commitment, Purchase Contract).
  - Risk resolution workflow with legal settlement notes and audit logging.
  - Prominent regulatory disclaimer: AI-assisted preliminary review system — NOT a legally authoritative title search or title insurance underwriting commitment.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite 5
- **Styling**: Tailwind CSS + custom financial palette (Navy, Sky, Slate)
- **Data & State**: TanStack React Query + React Context API
- **Icons**: Lucide React
- **Routing**: React Router v6 with Role-Protected Layouts

### Backend & AI Engine
- **Web Framework**: FastAPI (Python 3.10+) with Pydantic v2 validation
- **ORM & Database**: SQLAlchemy 2.0 with automatic migration and JSON/JSONB support
- **Database Engine**: PostgreSQL (production / Docker Compose) & SQLite (zero-config local dev)
- **Document Processing**: PyMuPDF (fitz) for native PDF text extraction, Pillow & EasyOCR/pytesseract for scanned files
- **Security & Cryptography**: Argon2id password hashing, PyJWT (HS256)
- **Storage**: Local sanitized storage with pluggable S3 abstraction

---

## 3. Architecture & Directory Structure

```
project-root/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Endpoints (auth, dashboard, properties, transactions, docs, risks)
│   │   ├── core/            # Config, security (Argon2, JWT), database engine
│   │   ├── models/          # SQLAlchemy models (User, Property, Transaction, Document, RiskFinding, AuditLog)
│   │   ├── schemas/         # Pydantic v2 schemas and validation
│   │   ├── services/        # Storage providers (Local, S3 abstraction)
│   │   └── main.py          # FastAPI application, startup seeding, CORS
│   ├── tests/               # Pytest suite (Auth, Transactions, Documents AI, Risk engine)
│   ├── conftest.py          # Pytest path configuration
│   ├── requirements.txt     # Python backend dependencies
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components and modals
│   │   ├── contexts/        # AuthContext with session management
│   │   ├── layouts/         # AppLayout with responsive sidebar and role indicator
│   │   ├── pages/           # Dashboard, Transactions, Detail, Properties, Docs, Risks, Profile, Login, Register
│   │   ├── services/        # Fetch API service layer with Bearer token injection
│   │   ├── types/           # TypeScript domain definitions
│   │   └── index.css        # Tailwind directives and styling
│   ├── package.json
│   ├── vite.config.ts       # Vite proxy to backend port 8000
│   └── Dockerfile
│
├── ai_engine/
│   ├── extraction/          # PyMuPDF text extractor and regex/pattern classifier
│   ├── analysis/            # Preliminary Title Risk Identification Engine
│   └── services/            # BaseLLMProvider, FallbackDeterministicExtractor, Pipeline coordinator
│
├── storage/
│   └── documents/           # Secure local document store (outside webroot)
├── docker-compose.yml       # Production orchestration (PostgreSQL, Backend, Frontend)
├── .env.example             # Documented environment configuration template
├── README.md
└── PROJECT_PROGRESS.md
```

---

## 4. Quick Start & Local Execution

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### Step 1: Backend Setup
```bash
# 1. From the project root, install Python dependencies:
python -m pip install -r backend/requirements.txt

# 2. Configure environment:
cp .env.example .env

# 3. Start the FastAPI backend:
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
The backend initializes the database schema automatically and seeds realistic development accounts upon startup.
- **Swagger Interactive API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

### Step 2: Frontend Setup
```bash
# 1. Navigate to the frontend directory:
cd frontend

# 2. Install dependencies:
npm install

# 3. Run development server:
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Sample Development Credentials

The database is pre-seeded with four test accounts representing each supported user role:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Closing Agent** | `agent.sarah@titleflow.com` | `AgentPass123!` | Create & manage transactions, upload docs, inspect & verify AI extractions, resolve title flags |
| **Platform Admin** | `admin@titleflow.com` | `AdminPass123!` | Global platform oversight, all transactions, system configuration |
| **Home Buyer** | `buyer.john@example.com` | `BuyerPass123!` | View permitted closing transactions, download documents, track status |
| **Property Seller** | `seller.robert@example.com` | `SellerPass123!` | View permitted transactions, access documents, track closing progress |

*(The login page provides 1-click credential buttons for instant role switching during review.)*

---

## 6. Running Automated Tests

### Backend Test Suite
The backend contains a test suite verifying authentication, RBAC, transaction CRUD, synthetic PDF document generation, deterministic AI extraction, and preliminary risk detection.

```bash
# Run pytest:
python -m pytest backend/tests -v
```

All 8 tests pass:
- `test_auth.py::test_health_check`
- `test_auth.py::test_login_seeded_admin`
- `test_auth.py::test_login_invalid_password`
- `test_auth.py::test_register_and_login_new_user`
- `test_documents_ai.py::test_document_upload_and_extraction_pipeline`
- `test_risks.py::test_risk_detection_and_resolution`
- `test_transactions.py::test_dashboard_stats`
- `test_transactions.py::test_create_property_and_transaction`

### Frontend TypeScript Verification & Build
```bash
cd frontend
npm run build
```
Compiles with 0 TypeScript errors and generates an optimized production bundle.

---

## 7. Security Best Practices Implemented

- **Password Hashing**: State-of-the-art Argon2id password hashing via `argon2-cffi`.
- **JWT Protection**: Cryptographically signed HS256 tokens with configurable expiration.
- **Path Traversal Defense**: Stored documents are saved under isolated UUIDs; relative path resolution is validated against base storage boundaries.
- **MIME & Extension Enforcement**: Only authorized document formats (PDF, PNG, JPG, TIFF) are accepted.
- **Audit Logging**: Sensitive operations (login, registration, closing creation, document upload, status changes) record user, IP, action, and timestamp.
- **Data Privacy**: Granular role-based filtering ensures buyers and sellers only access their assigned closing files.
