import express, { type Request, type Response } from 'express';
import pool, { connectDB } from "./db.js"; // ESM needs .js extension
import cors from 'cors';
import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/authRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';
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
app.use('/borrowings', borrowRoutes);

// Start the server only after connecting to the database
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        
        // Start the automated revocation cron job
        // Runs every hour to revoke 'accepted' requests that are older than 24 hours
        setInterval(async () => {
            try {
                // Find expired requests
                const [rows]: any = await pool.execute(`
                    SELECT id, book_id FROM borrowings 
                    WHERE status = 'accepted' 
                    AND accepted_at < DATE_SUB(NOW(), INTERVAL 1 DAY)
                `);

                if (rows.length > 0) {
                    for (const row of rows) {
                        // Revoke the request
                        await pool.execute("UPDATE borrowings SET status = 'revoked' WHERE id = ?", [row.id]);
                        // Restore the available copy
                        await pool.execute("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?", [row.book_id]);
                    }
                    console.log(`Revoked ${rows.length} expired borrow requests.`);
                }
            } catch (err) {
                console.error("Error during automated revocation:", err);
            }
        }, 60 * 60 * 1000); // 1 hour
    });
});