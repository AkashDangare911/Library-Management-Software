import express, { type Request, type Response } from 'express';
import pool from '../db.js'; // Note the .js for ESM

const router = express.Router();

// GET /api/books/ (mounted at /api/books in app.ts)
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Books ORDER BY id DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ error: "Failed to fetch books" });
    }
});

export default router;
