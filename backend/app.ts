import express, { type Request, type Response } from 'express';
import pool, { connectDB } from "./db.js"; // ESM needs .js extension
import cors from 'cors';
import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/authRoutes.js';
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow frontend to call backend
app.use(express.json()); // Parse JSON bodies

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