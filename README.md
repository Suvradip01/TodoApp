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

To securely run the backend, you need to configure your environment variables. 

**Step 1:** Create a `.env` file in the `backend/` directory.

```bash
# Windows (PowerShell)
New-Item -Path "backend/.env" -ItemType File -Value "PORT=5000`r`nMONGO_URI=mongodb://localhost:27017/todoapp`r`nJWT_SECRET=secret`r`nEMAIL_USER=your_email@gmail.com`r`nEMAIL_PASS=your_app_password"
```

**Step 2:** Fill in your specific credentials in `backend/.env`.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/todoapp   # Connection string
JWT_SECRET=your_super_secret_jwt_key           # Secret for securing user tokens
EMAIL_USER=your_email@gmail.com                # Sender email for reminders
EMAIL_PASS=your_email_app_password             # Google App Password (NOT your login password)
```

---

#### 🔑 Helper Guide: How to get these values

> [!IMPORTANT]
> Never commit your `.env` file to version control. It is already added to `.gitignore`.

<details>
<summary><strong>1. MongoDB URI (Database Connection)</strong></summary>

- **Local (Easiest)**: Use `mongodb://localhost:27017/todoapp`. Requires MongoDB Community Server installed.
- **Cloud (MongoDB Atlas)**:
    1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
    2. Create a free cluster -> Click **Connect**.
    3. Select **Drivers** (Node.js).
    4. Copy the string (e.g., `mongodb+srv://user:<password>@...`).
    5. Replace `<password>` with your database user password.
</details>

<details>
<summary><strong>2. JWT Secret (Security Key)</strong></summary>

This is a random string used to sign session tokens.
- **Option A**: Use any long random string (e.g., `mySuperSecretKey123!`).
- **Option B (Secure)**: Generate one in your terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
</details>

<details>
<summary><strong>3. Email Credentials (For Reminders)</strong></summary>

You cannot use your standard Gmail password. You must use an **App Password**.
1. Go to your [Google Account Security](https://myaccount.google.com/security) page.
2. Enable **2-Step Verification** (if not already on).
3. Search for **"App Passwords"** in the search bar.
4. Create a new App Password (custom name: "TodoApp").
5. Copy the 16-character code into `EMAIL_PASS`.
</details>

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
