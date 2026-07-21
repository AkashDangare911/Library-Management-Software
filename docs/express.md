# Express & Node.js in Library Management Software

The backend of this application is powered by Node.js and Express. It serves as the API layer connecting the React frontend to the MySQL database.

## Concepts Used

### 1. Server Initialization & Dependency Management
We initialize a basic Express application but strictly start it *only* after a successful database connection is established. This prevents the server from taking HTTP requests if the database is down.
**Example from `app.ts`:**
```typescript
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
```

### 2. Route Handling
We define API endpoints (routes) that the frontend can call to retrieve or manipulate data.
**Example from `app.ts`:**
```typescript
// GET /api/books - Fetch all books from the database
app.get('/api/books', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Books ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books" });
    }
});
```

### 3. Middleware (CORS)
We use the `cors` middleware to allow Cross-Origin Resource Sharing. This is necessary because our React frontend runs on a different port (e.g., 5173 or another Vite default) than our backend (3000), and modern browsers block cross-origin requests by default for security.
**Example from `app.ts`:**
```typescript
import cors from 'cors';

const app = express();
app.use(cors()); // Allow frontend to call backend
```
