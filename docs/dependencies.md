# Project Dependencies

This document outlines the core third-party dependencies used in the Library Management Software, explaining why they were added and how they are used within the project.

---

## 💻 Frontend Dependencies

### 1. `react` & `react-dom`
- **Why it was added:** React is the core UI library used to build the interactive, component-based frontend. `react-dom` is specifically responsible for rendering these React components into the browser's DOM.
- **Example Usage:**
  ```tsx
  import React, { useState } from 'react';
  
  export const Home = () => {
    const [books, setBooks] = useState([]);
    return <div>{books.length} books found</div>;
  };
  ```

### 2. `react-router-dom`
- **Why it was added:** Necessary for client-side routing. It allows us to navigate between different pages (like `/login`, `/register`, and `/`) without triggering a full page refresh, resulting in a fast, SPA (Single Page Application) experience.
- **Example Usage:**
  ```tsx
  import { Routes, Route, useNavigate } from 'react-router-dom';
  
  // App.tsx routing
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
  </Routes>
  
  // Programmatic Navigation
  const navigate = useNavigate();
  navigate('/login');
  ```

### 3. `vite` (DevDependency)
- **Why it was added:** Vite is the build tool and development server. It was chosen over older tools (like Create React App/Webpack) because it is incredibly fast, offering instant server start and rapid Hot Module Replacement (HMR).

---

## ⚙️ Backend Dependencies

### 4. `express`
- **Why it was added:** Express is the most popular, minimal web framework for Node.js. It is used to quickly set up our HTTP server, handle API routes, and process incoming requests from the React frontend.
- **Example Usage:**
  ```typescript
  import express from 'express';
  const app = express();
  
  app.get('/api/books', (req, res) => {
      res.json([{ title: "Ikigai" }]);
  });
  ```

### 5. `mysql2`
- **Why it was added:** This is the MySQL driver that allows our Node.js server to talk to the MySQL database. We specifically chose `mysql2` because it natively supports modern JavaScript Promises, allowing us to use `async/await` syntax instead of outdated callback functions.
- **Example Usage:**
  ```typescript
  import mysql from 'mysql2/promise';
  
  const pool = mysql.createPool({ host: 'localhost', user: 'root' });
  const [rows] = await pool.query('SELECT * FROM Books');
  ```

### 6. `cors`
- **Why it was added:** CORS (Cross-Origin Resource Sharing) is a security feature in browsers. Since our frontend runs on a different port than our backend (e.g., localhost:5173 vs localhost:3000), the browser will block API requests by default. The `cors` middleware explicitly tells the browser that our frontend is allowed to fetch data from our backend API.
- **Example Usage:**
  ```typescript
  import cors from 'cors';
  
  app.use(cors()); // Enables cross-origin requests
  ```

### 7. `tsx`
- **Why it was added:** `tsx` is a seamless TypeScript execution environment. Unlike standard Node.js which only understands JavaScript, `tsx` allows us to directly run our backend `.ts` files (like `app.ts`) in development without manually compiling them to `.js` first.
- **Example Usage (in package.json scripts):**
  ```json
  "scripts": {
    "dev": "tsx watch app.ts"
  }
  ```

### 8. `dotenv`
- **Why it was added:** We use `dotenv` to securely load environment variables from a `.env` file into `process.env`. This prevents us from hardcoding sensitive information (like database credentials) directly into our source code, avoiding security risks when sharing or committing code.
- **Example Usage:**
  ```typescript
  import * as dotenv from "dotenv";
  
  // Automatically parses the .env file
  dotenv.config();
  
  const port = process.env.PORT || 3000;
  const dbUser = process.env.DB_USER;
  ```

### 9. `cookie-parser`
- **Why it was added:** Parses `Cookie` header and populates `req.cookies` with an object keyed by the cookie names. Essential for securely reading the `HttpOnly` JWT cookie sent by the browser.
- **Example Usage:**
  ```typescript
  import cookieParser from 'cookie-parser';
  app.use(cookieParser());
  const token = req.cookies.auth_token;
  ```

### 10. `jsonwebtoken`
- **Why it was added:** Used for generating and verifying JSON Web Tokens (JWT). This allows us to securely authenticate users without storing session data on the server (stateless authentication).
- **Example Usage:**
  ```typescript
  import jwt from 'jsonwebtoken';
  const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  ```

### 11. `bcrypt`
- **Why it was added:** Used for securely hashing passwords before storing them in the database, and for comparing login passwords against the hashed versions. It incorporates a salt to protect against rainbow table attacks.
- **Example Usage:**
  ```typescript
  import bcrypt from 'bcrypt';
  const hashedPassword = await bcrypt.hash(password, 10);
  const match = await bcrypt.compare(password, hashedPassword);
  ```

### 12. `nodemailer`
- **Why it was added:** Nodemailer is a module for Node.js applications to allow easy as cake email sending. It is used to send transactional emails such as welcome emails on user registration and notifications when a book is borrowed via SMTP.
- **Example Usage:**
  ```typescript
  import nodemailer from 'nodemailer';
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_APP_PASS } });
  await transporter.sendMail({ from: '...', to: '...', subject: '...', html: '...' });
  ```

### 13. `@react-email/components` & `@react-email/render`
- **Why it was added:** These libraries allow us to build email templates using React components instead of raw HTML strings. `@react-email/render` converts these React components into standard HTML that can be sent via Nodemailer.

---

## 🛡️ Shared Dependencies

### 12. `typescript`
- **Why it was added:** Used on both the frontend and backend to add static typing to JavaScript. It catches bugs during development (before the code even runs), provides excellent autocomplete in VS Code, and acts as built-in documentation for our data structures.
- **Example Usage:**
  ```typescript
  interface Book {
    id: number;
    title: string;
  }
  
  // TypeScript enforces that books is an array of Book objects
  const [books, setBooks] = useState<Book[]>([]);
  ```
