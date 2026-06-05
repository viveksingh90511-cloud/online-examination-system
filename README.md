# 🎓 Online Examination and Result Management System

A comprehensive full-stack web application for conducting online examinations, managing student records, and generating performance analytics. Built as a **Final Year B.Tech Computer Science Project**.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Grade System](#-grade-system)
- [Default Credentials](#-default-credentials)

---

## ✨ Features

### 🤖 Advanced AI Modules (New)
- 📄 **PDF Auto-Extraction**: Upload a PDF of MCQs; AI extracts questions, options, and correct answers automatically.
- 📷 **Biometric Face Registration**: Students must scan and register their face before starting an exam.
- 👁️ **Continuous AI Proctoring**: Live webcam tracking to detect missing faces, multiple persons, or looking away.
- 🚫 **Tab-Switch Detection**: Anti-cheat system that tracks if students navigate away from the exam tab.
- 📈 **Adaptive Difficulty Engine**: Question difficulty scales up or down based on student's live performance.
- 💡 **AI Feedback Generation**: Detailed performance feedback and personalized study insights upon exam completion.

### Admin Module
- 📊 Analytics Dashboard with Charts
- 👥 Student Management (CRUD)
- 📚 Subject Management
- 📝 Exam Management & Scheduling
- ❓ Question Bank Management (MCQ)
- 📈 Results & Performance Reports
- 📥 Export to PDF & Excel

### Student Module
- 🔐 Registration & Authentication
- 📝 Take Timed Online Exams
- ⏱️ Auto-Submit on Timeout
- 📊 Instant Results & Grade
- 📋 Exam History
- 🏆 Leaderboard & Rankings
- 👤 Profile Management

### Security
- 🔑 JWT Authentication
- 🔒 bcrypt Password Hashing
- 🛡️ Role-Based Access Control
- ✅ Input Validation (express-validator)
- 🚫 SQL Injection Prevention
- 🔐 Secure API Responses

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, React Router, Chart.js, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL |
| **Auth** | JWT, bcrypt |
| **Reports** | PDFKit, ExcelJS |
| **Build Tool** | Vite |

---

## 📁 Project Structure

```
├── database/
│   └── database.sql          # MySQL schema & seed data
├── backend/
│   ├── config/db.js          # MySQL connection pool
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth, validation, error handling
│   ├── models/               # SQL query layer
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic (email, PDF, Excel, grading)
│   ├── utils/                # Helpers & constants
│   ├── app.js                # Express app setup
│   └── server.js             # Entry point
├── frontend/
│   └── src/
│       ├── context/          # Auth & Theme providers
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # Page layouts
│       ├── pages/            # All page components
│       ├── routes/           # Route configuration
│       ├── services/         # API service layer
│       ├── App.jsx           # Root component
│       └── index.css         # Design system
├── docs/                     # Project documentation
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** v18+ 
- **MySQL** v8.0+
- **npm** v9+

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd "online examination and result management system"
```

### Step 2: Setup Database
```bash
# Login to MySQL and run the schema
mysql -u root -p < database/database.sql
```

### Step 3: Setup Backend
```bash
cd backend
npm install

# Configure environment variables
# Edit .env file with your MySQL credentials

npm run dev
```

### Step 4: Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 5: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@examportal.com | admin123 |
| **Student** | Register via the app | - |

---

## 📊 Grade System

| Percentage | Grade |
|-----------|-------|
| 90 - 100 | A+ |
| 80 - 89 | A |
| 70 - 79 | B |
| 60 - 69 | C |
| Below 60 | F |

**Passing Percentage: 60%**

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/login` | Login (admin/student) |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List all students |
| GET | `/api/students/:id` | Get student by ID |
| POST | `/api/students` | Create student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | List all subjects |
| POST | `/api/subjects` | Create subject |
| PUT | `/api/subjects/:id` | Update subject |
| DELETE | `/api/subjects/:id` | Delete subject |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams` | List all exams |
| GET | `/api/exams/available` | Available exams (student) |
| POST | `/api/exams` | Create exam |
| POST | `/api/exams/:id/start` | Start exam (student) |
| POST | `/api/exams/:attemptId/submit` | Submit exam |

### Results & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/results` | All results |
| GET | `/api/results/my-results` | Student's results |
| GET | `/api/results/leaderboard` | Leaderboard |
| GET | `/api/dashboard/admin` | Admin analytics |
| GET | `/api/reports/excel` | Export Excel |

---

## 📄 License

This project is developed for educational purposes as a B.Tech Final Year Project.

---

## 👨‍💻 Developer

**Online Examination and Result Management System**  
B.Tech Computer Science — Final Year Project  
© 2026
