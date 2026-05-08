# Yellow Baby Frontend

This is the React + Vite frontend for the Yellow Baby e-commerce application. It provides a mobile-first, responsive user interface styled with Tailwind CSS.

## Features
- **Product Browsing**: Filter by category, gender, age group, and size.
- **Cart & Checkout**: State management for adding items to the cart and processing checkout via the backend API.
- **User Authentication**: JWT-based authentication using mobile number and OTP.
- **Order Tracking**: View past orders and download PDF invoices.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Ensure your `.env` file points to the backend server.
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   # Or use your ngrok URL if testing online:
   # VITE_API_BASE_URL=https://xxxx-xxxx.ngrok-free.app
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Architecture
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **API Communication**: Axios (configured in `src/api/api.js` with auto-refresh logic for JWT tokens)
