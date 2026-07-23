import express, { type Request, type Response } from 'express';
import pool from '../db.js'; // Note the .js for ESM

import { HTTP_STATUS, BOOK_MESSAGES } from '../utils/responseCodes.js';
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /books 
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Books ORDER BY id');
        res.status(HTTP_STATUS.OK).json(rows);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: BOOK_MESSAGES.FETCH_ERROR });
    }
});

router.get('/:bookID', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { bookID } = req.params;
        const [book]: any = await pool.query('SELECT title, author, total_copies, available_copies, description FROM Books WHERE id = ?', [bookID]);

        if (book.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Book not found" });
        }

        res.status(HTTP_STATUS.OK).json(book[0]);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: BOOK_MESSAGES.FETCH_ERROR });
    }
});

export default router;
