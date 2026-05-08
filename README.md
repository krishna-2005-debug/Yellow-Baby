# Yellow Baby E-Commerce Application

A full-stack e-commerce application built for a kids' clothing store, featuring a React frontend and a Django backend.

## Project Structure

- **`backend/`**: Django REST Framework API, custom Admin panel, MySQL database configuration.
- **`forntend/`**: React + Vite frontend application styled with Tailwind CSS.

## Features Finalized

- **Dynamic Homepage Control**: Hero sliders, quick categories, and age-group cards are entirely managed via Django Admin.
- **Robust E-Commerce Flows**: Complete Add-to-Cart logic, variant sizing checks, and real-time checkout updates.
- **Admin Analytics Dashboard**: Custom Django view offering business insights (orders today, pending orders, revenue, low stock).
- **User State Persistence**: Seamless JWT authentication mapping users to their cart items, addresses, and order histories.
- **Visual Polish**: Advanced micro-animations, glass-morphism navbar, optimized fallback UI states (e.g., "No Image" blocks), and responsive mobile filters.

---

## Step-by-Step Setup & Run Guide

### 1. Database Setup (MySQL)
Ensure you have MySQL installed and running. Create the database:
```sql
CREATE DATABASE IF NOT EXISTS yellow_baby_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```
*(Make sure the credentials in `backend/yellow_baby_backend/settings.py` match your MySQL setup. The default password is set to `1234` for user `root`.)*

### 2. Run the Backend (Django)
Open a new terminal and run the following commands:
```bash
# Navigate to the backend directory
cd backend

# Activate the virtual environment
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # Mac/Linux

# Apply database migrations
python manage.py migrate

# Create a superuser for the admin panel (optional if you already have one)
python manage.py createsuperuser

# Start the Django development server
python manage.py runserver
```
The backend will be available at **http://127.0.0.1:8000/**.
The Admin Panel is at **http://127.0.0.1:8000/admin/**.

### 3. Run the Frontend (React + Vite)
Open **another new terminal** and run the following commands:
```bash
# Navigate to the frontend directory
cd forntend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend will be available at **http://localhost:5173/**.

---

### Optional: Exposing the Backend Online (via ngrok)
If you want to access your local backend over the internet (or test it externally):
1. In a new terminal, run:
   ```bash
   ngrok http 8000
   ```
2. Copy the `https://xxxx-xxxx.ngrok-free.app` URL provided by ngrok.
3. Open `forntend/.env` and update the URL:
   ```env
   VITE_API_BASE_URL=https://xxxx-xxxx.ngrok-free.app
   ```
4. Restart the frontend server (`npm run dev`).
*(Note: CSRF Trusted Origins for ngrok have already been configured in `settings.py`.)*
