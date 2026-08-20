# DHAS — Digital Health Assistant System

DHAS is a full-stack healthcare web application that connects patients and doctors on a single platform. It combines symptom tracking, medicine reminders, medical report management, activity tracking, and real-time encrypted messaging into one PWA-ready application, built as a college group project.

The system is designed around two distinct portals — a Patient Portal and a Doctor Portal — that share a common backend but have separate authentication, dashboards, and permissions.

## Overview

Patients can register, build out a health profile, run a rule-based symptom checker, set up medicine reminders with recurring alarms, upload and manage medical reports, track daily steps, and connect with doctors using an invite-code system. Doctors can register, complete a professional profile, accept or reject patient connection requests, view patient-shared symptom history and reports, and communicate with patients through an end-to-end encrypted chat system.

The application is built as a Progressive Web App, so it can be installed on a device and works with offline caching through a Service Worker.

## Core Features

**Symptom Checker**
Patients select from a fixed set of symptoms and receive a rule-based condition diagnosis (e.g. viral fever, common cold, respiratory distress) along with a severity rating, a written suggestion, a condition-specific diet plan, and home remedies. Every check is saved to the patient's history and can optionally be shared with a connected doctor.

**Medicine Reminders**
Reminders support multiple schedule types — daily, alternate-day, weekly, twice-weekly, three-times-a-week, monthly, and fully custom day selection — with one, two, or three configurable dose times per day. Reminders can be set to run indefinitely or for a fixed number of days, after which they are automatically purged. Alarms are generated client-side using the Web Audio API and also fire as background browser notifications through the Service Worker, so reminders continue to work even when the app is not the active tab.

**Real-Time Encrypted Chat**
Patients and doctors who are connected can message each other in real time over Socket.IO. Text messages, images, PDFs, and voice notes are all supported. The chat system supports end-to-end key exchange using ECDH (P-256) with AES-256-GCM for message encryption, so the server acts only as a relay and public-key bulletin board — it never has access to plaintext content or private keys. Presence (online/last-seen) and read receipts are also tracked in real time.

**Medical Reports**
Patients can upload PDF or image reports, which are stored as base64 in the database, and can view, download, or delete them at any time. Reports can also be shared directly inside a chat conversation with a connected doctor, who can then view them from their own dashboard.

**Doctor–Patient Connections**
Every doctor receives a unique invite code on registration. Patients enter this code to send a connection request, which the doctor can accept or decline. Once accepted, a chat room is automatically created between the two, and the doctor gains read access to the patient's shared symptom history and reports.

**Activity / Step Tracker**
Step counting uses the device's accelerometer (via the Generic Sensor API where available, falling back to `devicemotion`) with a custom peak-detection algorithm that filters out phone shaking and other non-walking motion. It tracks daily step goals, streaks, a weekly chart, lifetime statistics, achievements, and a monthly calendar view. Step tracking requires a secure context (HTTPS or `localhost`) — browsers block motion sensor access otherwise.

**Multi-language Support**
The interface can be switched between English, Hindi, and Telugu, with translations applied dynamically across all pages.

## Technology Stack

**Backend**
- Node.js with Express 5
- MySQL (via `mysql2`) for persistent storage
- Socket.IO for real-time chat, presence, and typing indicators
- JSON Web Tokens for authentication, with separate token shapes for patients and doctors
- bcrypt for password hashing
- Multer for handling chat file uploads
- express-rate-limit for basic abuse protection on auth routes

**Frontend**
- Vanilla HTML, CSS, and JavaScript (no framework)
- Bootstrap for base layout utilities on select pages
- Web Crypto API for client-side end-to-end encryption
- Service Worker for PWA installability and offline caching
- Tabler Icons, DM Sans, and Fraunces for the visual design system

**Infrastructure**
- Designed to be deployed on Render, with automatic cache-busting tied to the deployment's git commit hash
- CORS is configured to allow local development origins as well as production domains


## Project Structure

```
DHAS/
├── Backend/
│   ├── config/
│   │   ├── db.js                    MySQL connection pool
│   │   └── socket.js                Socket.IO server, presence tracking, message relay
│   ├── controllers/
│   │   ├── authController.js        Patient register/login/Google auth
│   │   ├── doctorController.js      Doctor register/login, connections, patient views
│   │   ├── chatController.js        Chat REST endpoints (contacts, messages, uploads)
│   │   ├── keyController.js         E2E public key exchange endpoints
│   │   ├── profileController.js     Patient profile CRUD, account deletion
│   │   ├── changePasswordController.js
│   │   ├── reminderController.js
│   │   ├── reminderlogcontroller.js
│   │   ├── reportController.js
│   │   └── symptomController.js
│   ├── middleware/
│   │   ├── authMiddleware.js        requireAuth / requireAnyAuth (patient + doctor)
│   │   ├── doctorAuthMiddleware.js  requireDoctorAuth
│   │   ├── chatAuthMiddleware.js    identifyChatUser (role-aware)
│   │   └── uploadMiddleware.js      Multer config for chat file uploads
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── keyRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── reminderRoutes.js
│   │   ├── reminderlogroutes.js
│   │   ├── reportRoutes.js
│   │   └── symptomRoutes.js
│   └── utils/
│       ├── chatAccess.js            Room access verification, connection helpers
│       ├── health-data-node.js      Single source of truth for conditions/diet/remedies
│       ├── SeverityLogic.js         Re-exports from health-data-node.js
│       └── suggestions.js           Re-exports from health-data-node.js
│
├── frontend/
│   ├── js/
│   │   ├── config.js                API_BASE, auth header helpers, openChat()
│   │   ├── auth.js                  Login/register/Google auth handlers
│   │   ├── crypto.js                E2E encryption (ECDH + AES-GCM)
│   │   ├── chat.js                  Chat UI, Socket.IO client, voice messages
│   │   ├── health-data.js           Frontend copy of conditions/diet/remedies
│   │   ├── symptom.js               Symptom checker logic
│   │   ├── severity.js              Results page rendering
│   │   ├── reminder.js              Reminder CRUD, alarm engine, notifications
│   │   ├── alarm-global.js          Lightweight alarm engine for non-reminder pages
│   │   ├── steps.js                 Step tracking, sensor logic, activity scoring
│   │   ├── report.js                Report upload/view/delete
│   │   ├── language.js              i18n translations and application
│   │   ├── main.js                  Shared utilities, Service Worker registration
│   │   └── socket.io.min.js         Bundled Socket.IO client
│   ├── css/
│   │   ├── style.css                Main design system (theming, components)
│   │   └── bootstrap.min.css
│   ├── database/
│   │   └── schema.sql               Copy of DB schema
│   ├── theme.js                     Dark/light mode toggle
│   ├── manifest.json                PWA manifest
│   ├── index.html                   Landing page
│   ├── login.html
│   ├── register.html
│   ├── doctor_login.html
│   ├── doctor_register.html
│   ├── dashboard.html               Patient dashboard
│   ├── doctor_dashboard.html        Doctor dashboard
│   ├── symptom.html
│   ├── results.html
│   ├── symptom_history.html
│   ├── symptom_diet.html
│   ├── symptom_remedies.html
│   ├── diet.html
│   ├── remedies.html
│   ├── reminder.html
│   ├── saved_reminders.html
│   ├── reports.html
│   ├── steps.html
│   ├── profile.html
│   ├── profile_details.html
│   ├── change_password.html
│   ├── chat.html
│   ├── find_doctor.html
│   ├── my_doctors.html
│   ├── doctor_profile_public.html
│   ├── language.html
│   └── 404.html
│
├── database/
│   └── schema.sql                   Primary DB schema (tables + migrations)
│
├── server.js                        Express app entry point, Socket.IO init, static serving
├── sw.js                            Service Worker (PWA caching, background alarms)
├── package.json
└── .env                             Environment variables (not committed)
```
## Prerequisites

Before setting up the project locally, make sure the following are installed:

- Node.js, version 18 or later
- MySQL, version 8.0 or later, running locally or accessible over the network
- npm (bundled with Node.js)
- Git

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd DHAS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Create the database and load the schema:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dhas_db;"
mysql -u root -p dhas_db < database/schema.sql
```

The schema file creates all required tables, including users, doctors, user profiles, symptoms, reminders, reminder logs, reports, doctor-patient connections, chat rooms, and chat messages. It also includes safe, idempotent migration procedures, so it can be re-run against an existing database without causing errors.

### 4. Configure environment variables

Create a file named `.env` in the project root (same folder as `package.json`) and paste in the following, replacing the placeholder values with your own:

```env
# Server
PORT=3007

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dhas_db
DB_PORT=3306

# Authentication
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

# CORS — origins allowed to call the API and connect via Socket.IO
ALLOWED_ORIGIN=http://localhost:3007
ALLOWED_ORIGINS=http://localhost:3007,http://192.168.1.100:3007

# Deployment metadata (optional — Render sets this automatically)
RENDER_GIT_COMMIT=
```

`JWT_SECRET` should be a long, random string kept private — it is used to sign and verify both patient and doctor authentication tokens. `ALLOWED_ORIGINS` accepts a comma-separated list and is used both for standard CORS checks and for validating Socket.IO connection origins.

This `.env` file should never be committed to version control — make sure it is listed in `.gitignore`.

### 5. Start the server

```bash
npm start
```

By default the server runs on port 3007. Once running, open:
