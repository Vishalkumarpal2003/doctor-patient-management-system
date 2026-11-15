# 🏥 CuraHealth - Doctor Patient Management System (MERN Stack)

A complete, modern, and production-grade **Doctor-Patient Management System** built with the **MERN Stack** (MongoDB, Express.js, React.js with Vite, Node.js, and Tailwind CSS).

---

## 🌟 Key Features

### 1. Multi-Role Architecture
- **Patient Dashboard**: Profile management, search and filter doctors, check real-time available slots, book appointments with conflict detection, cancel appointments, and access digital prescriptions & medical history.
- **Doctor Dashboard**: Manage professional profile, set consultation fees, configure consulting days and working hours, view appointments queue, accept/reject requests, and issue digital prescriptions and clinical diagnoses.
- **Admin Dashboard**: System-wide analytics (Patients, Doctors, Appointments, Revenue), approve/revoke doctor credentials, activate/deactivate accounts, monitor all appointments, and inspect financial transaction records.

### 2. Intelligent Appointment Engine
- **Live Slot Availability**: Generates dynamic 30-minute intervals according to doctor working hours and active consulting days.
- **Strict Duplicate Prevention**: Guarantees no two patients can reserve the same doctor slot at the same time.
- **Status Lifecycle**: `Pending` ➔ `Confirmed` ➔ `Completed` / `Cancelled` / `Rejected`.
- **Cancellation & Refund Support**: Patients, doctors, or administrators can cancel appointments with reason tracking.

### 3. Digital Clinical Records & Prescriptions
- Doctors record primary diagnosis, prescribed medications (with name, dosage, frequency, duration), diagnostic tests advised, dietary/lifestyle instructions, and follow-up review dates.
- Printable, authentic hospital prescription sheet with hospital letterhead, doctor credentials, and digital stamp.

### 4. Zero-Friction Database Architecture
- Supports standard **MongoDB** (Local or MongoDB Atlas) via Mongoose.
- Includes an **automatic In-Memory fallback store** if a standalone MongoDB daemon is not currently active, allowing instant zero-configuration testing out-of-the-box.
- Built-in auto-seeder populates demo doctors, patients, admin, and clinical appointments on initial run.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+)
- (Optional) **MongoDB** installed locally or MongoDB Atlas connection string.

---

### Step 1: Install Dependencies

```bash
# In the root directory:
npm run install:all
```
*Or install separately:*
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Step 2: Environment Configuration

Create a `.env` file in the `backend/` directory (a `.env.example` is provided):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
JWT_SECRET=curahealth_super_secret_jwt_key_2026
```

---

### Step 3: Run the Application

You can start the backend and frontend in separate terminals:

#### Terminal 1: Backend Server
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000`*

#### Terminal 2: Frontend Web App
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 Pre-Seeded Demo Accounts

The application automatically seeds realistic records so you can test every role immediately:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@curahealth.com` | `password123` | Full access to doctor approvals, user status & financials |
| **Doctor** | `sarah.jenkins@curahealth.com` | `password123` | Cardiologist, 12 yrs exp, $90 consultation fee |
| **Doctor** | `marcus.vance@curahealth.com` | `password123` | Neurologist, 15 yrs exp, $110 consultation fee |
| **Doctor** | `elena.rostova@curahealth.com` | `password123` | Dermatologist, 8 yrs exp, $75 consultation fee |
| **Patient** | `alex.patient@curahealth.com` | `password123` | Blood Group O+, hypertension stage 1 |
| **Patient** | `sophia.patient@curahealth.com` | `password123` | Blood Group A+, contact dermatitis history |

> **Tip:** The Login page features **One-Click Demo Buttons** to automatically fill credentials for Patient, Doctor, or Admin.

---

## 📁 Project Structure

```
HOSPITAL-MANAGEMENT-SYSTEM-main/
├── backend/
│   ├── config/
│   │   ├── db.js                # Database connection & fallback logic
│   │   └── memoryStore.js       # In-memory query engine for zero-config run
│   ├── controllers/
│   │   ├── adminController.js   # Admin analytics, approvals & payments
│   │   ├── appointmentController.js # Booking, slot validation & cancellation
│   │   ├── authController.js    # JWT auth, registration, login & profiles
│   │   ├── doctorController.js  # Doctor slot calculation & appointments
│   │   └── prescriptionController.js # Diagnoses & medicine prescriptions
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT token verification & role enforcement
│   │   └── errorMiddleware.js   # Mongoose & standard error handlers
│   ├── models/
│   │   ├── Appointment.js       # Appointment schema & compound index
│   │   ├── DoctorProfile.js     # Specialization, fees & working hours
│   │   ├── PatientProfile.js    # Blood group, allergies & emergency contact
│   │   ├── Prescription.js      # Diagnosis, medicines & test orders
│   │   ├── User.js              # User auth, bcrypt hashing & roles
│   │   └── modelProxy.js        # Universal database model router
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── prescriptionRoutes.js
│   ├── tests/
│   │   └── apiTest.js           # Automated backend test suite
│   ├── utils/
│   │   ├── autoSeed.js          # Startup automated database seeder
│   │   ├── seed.js              # Manual CLI seeder
│   │   └── seedData.js          # Default doctors, patients & appointments
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Express app entrypoint
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, Footer, Modal, StatusBadge, Spinner
│   │   │   ├── doctor/          # PrescriptionModal, DoctorSettings
│   │   │   └── patient/         # PrescriptionViewModal (Printable)
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state & persistent login
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Hero, specialties & featured doctors
│   │   │   ├── About.jsx        # Hospital clinical pillars & facility stats
│   │   │   ├── Doctors.jsx      # Doctor directory with search & filters
│   │   │   ├── Login.jsx        # Login with one-click demo credentials
│   │   │   ├── Register.jsx     # Dual-role Patient/Doctor registration
│   │   │   ├── BookAppointment.jsx # Real-time interactive slot reservation
│   │   │   ├── PatientDashboard.jsx# Patient visits & profile management
│   │   │   ├── DoctorDashboard.jsx # Doctor appointments, queue & RX issuing
│   │   │   ├── AdminDashboard.jsx  # Admin analytics, approvals & payments
│   │   │   ├── MedicalRecords.jsx  # Patient prescription history
│   │   │   └── NotFound.jsx     # 404 handler
│   │   ├── services/
│   │   │   └── api.js           # Axios API service client
│   │   ├── App.jsx              # Client routing & protected routes
│   │   ├── main.jsx             # React entrypoint
│   │   └── index.css            # Tailwind CSS styling
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .env.example
├── package.json
└── README.md
```

---

## 🛠️ REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Patient or Doctor |
| `POST` | `/api/auth/login` | Public | Authenticate user & retrieve JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Private | Update user details & role profile |
| `PUT` | `/api/auth/change-password`| Private | Update account password |

### Doctors (`/api/doctors`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Public | Search approved doctors with filters |
| `GET` | `/api/doctors/:id` | Public | Retrieve doctor profile by ID |
| `GET` | `/api/doctors/:id/available-slots` | Public | Calculate live available slots for a date |
| `GET` | `/api/doctors/my/appointments` | Doctor | Doctor's appointment queue |
| `GET` | `/api/doctors/dashboard/stats` | Doctor | Doctor metrics & earnings |
| `PUT` | `/api/doctors/appointments/:id/status` | Doctor | Confirm, complete, or reject appointment |

### Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/appointments` | Patient | Book slot (prevents double bookings) |
| `GET` | `/api/appointments/my` | Patient | Patient's appointment history |
| `GET` | `/api/appointments/:id` | Private | Retrieve single appointment details |
| `PUT` | `/api/appointments/:id/cancel` | Private | Cancel appointment with reason |

### Prescriptions (`/api/prescriptions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/prescriptions` | Doctor | Add diagnosis & medicines to appointment |
| `GET` | `/api/prescriptions/my` | Patient | Retrieve all prescriptions for current patient |
| `GET` | `/api/prescriptions/appointment/:id`| Private | Retrieve prescription by appointment ID |

### Admin (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | System stats, revenue & counts |
| `GET` | `/api/admin/doctors` | Admin | List doctors with approval status filter |
| `PUT` | `/api/admin/doctors/:id/approval` | Admin | Approve or suspend doctor |
| `GET` | `/api/admin/patients` | Admin | List registered patients |
| `PUT` | `/api/admin/users/:id/toggle-status`| Admin | Deactivate / Activate user account |
| `GET` | `/api/admin/appointments` | Admin | Monitor all appointments across hospital |
| `GET` | `/api/admin/payments` | Admin | Financial ledger & transaction records |

---

## 🧪 Testing the Application

To run the automated backend verification suite:
```bash
npm run test:api
```
This tests:
1. Admin, Doctor, and Patient login with JWT verification.
2. Doctor directory search and filtering.
3. Available slot calculations for specific dates.
4. Booking an appointment and verifying slot availability.
5. Duplicate booking conflict prevention (HTTP 409 Conflict).
6. Doctor acceptance and status update.
7. Adding clinical diagnosis, medications, and tests advised.
8. Patient appointment history & medical record retrieval.
9. Admin metrics, revenue ledger, and doctor credential approval.

---

## 📄 License
This project is licensed under the ISC License.
