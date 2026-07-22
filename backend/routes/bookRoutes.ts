import express, { type Request, type Response } from 'express';
import pool from '../db.js'; // Note the .js for ESM

import { HTTP_STATUS, BOOK_MESSAGES } from '../utils/responseCodes.js';

const router = express.Router();

// GET /books (mounted at /books in app.ts)
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Books ORDER BY id');
        res.status(HTTP_STATUS.OK).json(rows);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: BOOK_MESSAGES.FETCH_ERROR });
    }
});

export default router;
