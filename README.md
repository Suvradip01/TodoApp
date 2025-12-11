# 📝 Advanced MERN ToDo Application

A full-stack implementation of a robust Task Management System. This project demonstrates a production-ready Web App using the MERN stack (MongoDB, Express, React, Node.js) with real-time updates, visualized analytics, and a precision reminder system.

## ✨ Key Features

- **Authentication & Security**: Secure user registration and login using JWT (JSON Web Tokens).
- **Task Management**: Full CRUD operations (Create, Read, Update, Delete) for tasks.
- **📊 Activity Analytics**: Interactive line chart visualizing "Created" vs "Completed" tasks over the last week.
    - *Tech*: Recharts / MUI X-Charts.
    - *Highlight*: Custom dark/light mode adaptable themes.
- **🔔 Precision Reminders**: Automated email notifications sent **exactly 10 minutes** before a task is due.
    - *Tech*: Node-cron & Nodemailer with idempotency checks (database-level locking) to guarantee exactly-once delivery.
- **🎨 Modern UI/UX**:
    - **Dark/Light Mode**: Fully responsive theme switching (Shadcn UI / Tailwind CSS).
    - **Animations**: Smooth transitions and interactive elements.
    - **Glassmorphism**: Premium aesthetic design.

---

## 🚀 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Material UI (MUI), Framer Motion, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ORM).
- **Tooling**: Docker, Docker Compose, ESLint.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local instance or Atlas URI)
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TodoApp
```

### 2. Environment Configuration
You need to set up environment variables for the backend.
Create a `.env` file in the `backend/` directory:

```env
# backend/.env

PORT=5000
MONGO_URI=mongodb://localhost:27017/todoapp  # Or your MongoDB Atlas Connection String
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com              # For sending reminders
EMAIL_PASS=your_email_app_password           # Google App Password (if using Gmail)
```

### 3. Run Locally (Manual)

**Backend:**
```bash
cd backend
npm install
npm run server  # Uses nodemon for dev
```
*Server runs on port 5000.*

**Frontend:**
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```
*Frontend runs on http://localhost:5173 (or similar).*

---

## 🐳 Run with Docker (Recommended)

If you have Docker installed, you can spin up the entire stack with one command.

**1. Where to run:**
Open your terminal in the **root directory** of the project (`TodoApp/`), where the `docker-compose.yml` file is located.

**2. Start the App:**
```bash
docker-compose up --build
```
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

**3. Stop the App:**
- Press `Ctrl + C` in the terminal to stop.
- To remove containers completely, run:
  ```bash
  docker-compose down
  ```

---

## 🧪 Testing the Features

1.  **Auth**: Register a new user.
2.  **Tasks**: Create a task.
3.  **Graph**: Go to the Dashboard. You will see the "Weekly Activity" graph update instantly. Try toggling Dark Mode (check the UI button) to see the graph adapt.
4.  **Reminders**:
    - Create a task with a Due Date exactly **11-12 minutes from now**.
    - Watch the backend logs.
    - In ~2 minutes, the cron job will run, detect the task is due in 10 mins, and send an email.
    - Check your inbox (and the database `reminderSent` flag).

---

## 📂 Project Structure

```
TodoApp/
├── backend/            # Express API
│   ├── models/         # Mongoose Schemas (User, Todo)
│   ├── routes/         # API Routes (auth, todos)
│   ├── services/       # Business Logic (reminderService.js)
│   ├── middleware/     # Auth middleware
│   └── server.js       # Entry point
├── frontend/           # React App (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI (ActivityGraph, TaskCard)
│   │   ├── pages/      # Route Pages (Dashboard, Login)
│   │   └── api/        # Axios configuration
│   └── main.jsx        # App entry
└── docker-compose.yml  # Orchestration
```
