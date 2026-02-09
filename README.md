# 🌌 Digital Matter Manager

A high-performance, full-stack monorepo for managing digital assets. Built with .NET Web API and Dapper for lightning-fast data access, paired with a lightweight Vanilla JS frontend.

---

## 🏗️ Architecture Overview

### Backend: .NET, Dapper & PostgreSQL

Built with **.NET 10** using a **Layered Architecture** pattern for maintainability and separation of concerns.

#### **Dapper (Micro-ORM)**
Chosen over Entity Framework for:
- **Performance**: Near-native SQL execution speeds
- **Control**: Full visibility into database queries  
- **Transparency**: Actual creation scripts alongside seeded data instead of auto-generated schemas

### Frontend: Vanilla JS & CSS

Pure JavaScript, HTML5, and CSS3 for:
- Minimal footprint and fast load times
- Zero framework dependencies or build steps
- Easy static site deployment

**Architecture**: API logic in `services/`, UI logic in `components/`.

---

## 🗄️ Database & Migrations

**Flyway** handles database versioning, keeping all environments (Local, Staging, Production) in sync.

- **Migration Path**: `backend/Backend.API/Migrations`
- **Version Control**: Tracked migrations for easy rollbacks
- **Idempotency**: Migrations run only once
- **Flyway Clean**: Enabled for schema resets during development

---

## 📊 Entity Relationship Diagram

<img width="628" alt="ERD" src="https://github.com/user-attachments/assets/1dec8034-1373-49de-82ec-40d9c2d74137" />

### **Core Entities:**
- **Groups**: Hierarchical organisation (self-referencing parent-child)
- **DeviceTypes**: Device category templates
- **Firmware**: Version management
- **Devices**: Individual instances linking all entities

### **Relationships:**
- Devices → one DeviceType, one Firmware, one Group
- Groups → can have child Groups (hierarchical)

---

## 🔐 Configuration & Environment

Required environment variables (configured in `.env` locally, Render for production):

| Variable | Purpose |
|----------|---------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string for Dapper |

**Local Setup:**
1. Copy `.env.example` to `.env`
2. Add your PostgreSQL credentials
3. Ensure PostgreSQL is running
4. Run backend (migrations apply automatically)

---

## 🌐 Deployment

### **Frontend**
- **Platform**: GitHub Pages
- **URL**: https://katlehomyeza.github.io/digital-matter-manager/frontend/index.html
- **Config**: Points to production API via `baseUrl` in `api.service.js`

### **Backend**
- **Platform**: Render (Dockerised)
- **URL**: https://digital-matter-manager.onrender.com/api
- **Auto-Deploy**: Pushes to `main` trigger deployments

### **Database**
- **Hosting**: Managed PostgreSQL on NeonDB
- **Security**: SSL enforced in production

---

## 🌿 Branching Strategy

Follow this format for all branches:

- `feature/<name>` - New functionality (e.g., `feature/add-device-sorting`)
- `fix/<name>` - Bug fixes (e.g., `fix/connection-string-leak`)
- `enhancement/<name>` - Refactoring/improvements (e.g., `enhancement/dapper-optimization`)

> [!IMPORTANT]
> Keep your branch up to date with `main` before submitting PRs.

---

## 📁 Project Structure
```
DIGITAL-MATTER-MANAGER
├── .github/                      # CI/CD workflows
├── backend/                      
│   └── Backend.API/
│       ├── Controllers/          # API endpoints
│       ├── Services/             # Business logic
│       ├── Repositories/         # Data access (Dapper)
│       ├── Models/               # Entities & DTOs
│       ├── Migrations/           # Flyway SQL scripts
│       ├── Middleware/           # Custom middleware
│       ├── Program.cs            # Entry point
│       ├── Flyway.toml           # Migration credentials
│       └── .env                  # Database config
└── frontend/                     
    ├── components/               # UI components
    ├── services/                 # API calls
    ├── styles/                   # CSS
    ├── assets/                   # Images, icons
    └── index.html                # Entry point
```

---

## 🚀 Key Features

- **Performance**: Dapper queries, Vanilla JS, optimised payloads
- **Developer-Friendly**: Clear layering, automated migrations, standardised branching
- **Production-Ready**: Dockerised, CI/CD pipeline, health monitoring, SSL
- **Scalable**: Connection pooling, modular architecture, monorepo structure

---

## 🛠️ Getting Started

### Prerequisites
- .NET 10 SDK
- PostgreSQL 16+

### Local Development
```bash
# Clone repository
git clone https://github.com/your-username/digital-matter-manager.git
cd digital-matter-manager

# Setup environment
cp .env.example .env
# Edit .env with PostgreSQL credentials

# Run backend
cd backend/Backend.API
dotnet restore
dotnet run

# Serve frontend (in new terminal)
cd frontend
python -m http.server 8080
```

**Access:**
- Frontend: http://localhost:8080
- Backend: http://localhost:5162/api

---

## 📊 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Backend | .NET 10 | High-performance web API |
| Data Access | Dapper | Lightweight ORM |
| Database | PostgreSQL | Relational storage |
| Migrations | Flyway | Version control |
| Frontend | Vanilla JS | Zero-dependency UI |
| Deployment | Render + GitHub Pages | Cloud hosting |
| Containers | Docker | Consistent environments |

---

## 📱 How to Use the Application

Four interconnected tabs manage your IoT device fleet:

### 🗂️ **Groups**
Build hierarchical structures for organising devices (e.g., "Global Operations" → "North America" → "New York Warehouse").

- Click **+ New Group** to create parent groups
- Edit groups to add child groups beneath them
- Use pencil icon to edit, X to delete

### 📋 **Device Types**
Define device categories (GPS Tracker, Temperature Sensor, etc.) used when registering devices.

- Click **+ New Device Type** 
- Add name and description
- Assign to devices later

### 🔧 **Firmware**
Manage firmware versions and track what each device runs.

- Click **+ New Firmware**
- Enter version name and number (e.g., 1.0.0, 1.1.0)
- Link to device types
- Assign when adding devices

### 📡 **Devices**
Register individual devices with complete details.

**Displayed Info**: Name, Serial Number, Device Type, Firmware, Group, Date Added

- Click **+ New Device**
- Fill in name, serial, then select type, firmware, and group
- Edit or delete using card icons

### 🔄 **Workflow**
1. Create groups (organisational structure)
2. Define device types (categories)
3. Upload firmware (versions)
4. Register devices (link everything together)

**Example**: Create "New York Warehouse" group → Define "Temperature Sensor" type → Upload "v1.1" firmware → Register "Temperature Sensor 001" device

---
