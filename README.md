# Employee Directory

A full-stack Employee Directory application built with React, Django, and PostgreSQL.

## Tech Stack

- **Frontend**: React (Vite) + Axios
- **Backend**: Django + Django REST Framework
- **Database**: PostgreSQL
- **Deployment**: Render (both frontend and backend)

## Features

- Authentication (Login/Logout with JWT)
- View, Add, Update, Delete employees
- Search by name, filter by department
- Role-based protected routes

## Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd employee-directory
```

---

### 2. Backend Setup (Django)

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/employee_directory
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Run migrations and create a superuser:

```bash
python manage.py migrate
python manage.py createsuperuser
# Or use the seed command:
python manage.py seed_data
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

---

### 3. Frontend Setup (React)

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Render Deployment

### Backend (Web Service)
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`
- **Start Command**: `gunicorn core.wsgi:application`
- **Environment Variables**: Set `DATABASE_URL`, `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`

### Frontend (Static Site)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**: `VITE_API_URL=https://your-backend.onrender.com/api`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Login with email & password |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/auth/me/` | Current user session |
| GET | `/api/employees/` | List all employees |
| POST | `/api/employees/` | Create employee |
| GET | `/api/employees/:id/` | Get employee detail |
| PUT | `/api/employees/:id/` | Update employee |
| DELETE | `/api/employees/:id/` | Delete employee |

## Default Login

After running `python manage.py seed_data`:
- **Email**: `admin@company.com`
- **Password**: `admin123`
