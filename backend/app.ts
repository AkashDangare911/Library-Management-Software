import express, { type Request, type Response } from 'express';
import pool, { connectDB } from "./db.js"; // ESM needs .js extension
import cors from 'cors';
import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/authRoutes.js';
import * as dotenv from "dotenv";
import cookieParser from 'cookie-parser';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true })); // Allow frontend to call backend with cookies
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'App is running' });
});

// Use the separate book routes
app.use('/books', bookRoutes);
app.use('/auth', authRoutes);

// Start the server only after connecting to the database
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});