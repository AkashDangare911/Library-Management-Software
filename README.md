# 📚 Library Management Software

A modern, full-stack web application designed to manage library books, user registrations, and borrowing transactions. Built with a focus on clean architecture, beautiful UI (Glassmorphism), and modern JavaScript standards.

## ✨ Features
- **Book Catalog:** Browse available books with real-time stock status.
- **User Authentication:** Login and registration flows for library members.
- **Borrowing System:** Check out books with automatic stock management.
- **Email Notifications:** Automated emails on registration and book borrowing using Resend.
- **Wishlist:** Save books to your personal wishlist for future reference.
- **Responsive Design:** Beautiful, CSS-variable driven UI that works on all devices.

## 🛠️ Tech Stack

### Frontend
- **React 19:** Modern functional components and hooks.
- **TypeScript:** Strict static typing for props, state, and API payloads.
- **Vite:** Lightning-fast build tool and development server.
- **React Router:** Client-side routing for an SPA experience.
- **Vanilla CSS:** Custom design system utilizing CSS Variables and Glassmorphism.

### Backend
- **Node.js & Express:** Minimalist web framework handling API requests.
- **TypeScript & TSX:** Native TypeScript execution without manual compilation.
- **MySQL 2 (Promise):** Relational database with connection pooling and async/await support.
- **JWT & HttpOnly Cookies:** Stateless, secure user authentication.
- **Dotenv:** Secure environment variable management.
- **CORS:** Cross-origin resource sharing enabled for frontend communication.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server

### 1. Database Setup
1. Open your MySQL client.
2. Run the `init.sql` script located in the `backend/` folder to create the `LIBRARY_DB` database and necessary tables.

### 2. Backend Setup
```bash
cd backend
npm install
# Copy .env.example to .env and fill in your MySQL credentials
cp .env.example .env
# Start the backend server (runs on port 3000)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Start the React development server (runs on port 5173)
npm run dev
```

## 📖 Documentation
Detailed documentation about the specific technologies and architectural concepts used in this repository can be found in the `docs/` folder:
- `docs/react.md` - Functional components, hooks, routing.
- `docs/typescript.md` - Interfaces, generic types, typed Express handlers.
- `docs/express.md` - Routing, CORS, API design.
- `docs/authentication.md` - JWT, HttpOnly Cookies, and Auth Flow.
- `docs/mysql.md` - Connection pooling, Relational Schema, async/await.
- `docs/css.md` - Design System, CSS Variables, Glassmorphism, Animations.
- `docs/dependencies.md` - Complete list of third-party libraries used.
