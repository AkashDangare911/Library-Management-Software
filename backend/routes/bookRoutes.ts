import express, { type Request, type Response } from 'express';
import pool from '../db.js'; // Note the .js for ESM

import { HTTP_STATUS, BOOK_MESSAGES } from '../utils/responseCodes.js';
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /books 
router.get('/', async (req: Request, res: Response) => {
    try {
        const { search, category, rating, available, page, limit, sort } = req.query;
        
        // Pagination logic
        const currentPage = parseInt(page as string) || 1;
        const itemsPerPage = parseInt(limit as string) || 10;
        const offset = (currentPage - 1) * itemsPerPage;

        let baseQuery = ' FROM Books WHERE 1=1';
        const params: any[] = [];

        if (search) {
            baseQuery += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (category) {
            baseQuery += ' AND category = ?';
            params.push(category);
        }

        if (rating) {
            baseQuery += ' AND rating >= ?';
            params.push(Number(rating));
        }

        if (available === 'true') {
            baseQuery += ' AND available_copies > 0';
        }

        let orderClause = ' ORDER BY id';
        if (sort === 'rating_desc') {
            orderClause = ' ORDER BY rating DESC, id ASC';
        }

        // Count total items for pagination
        const countQuery = 'SELECT COUNT(*) as total' + baseQuery;
        const [countResult]: any = await pool.query(countQuery, params);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Fetch paginated books
        const dataQuery = 'SELECT *' + baseQuery + orderClause + ' LIMIT ? OFFSET ?';
        // params need to be pushed again for LIMIT and OFFSET
        const dataParams = [...params, itemsPerPage, offset];

        const [rows] = await pool.query(dataQuery, dataParams);
        
        res.status(HTTP_STATUS.OK).json({
            books: rows,
            totalItems,
            totalPages,
            currentPage
        });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: BOOK_MESSAGES.FETCH_ERROR });
    }
});

router.get('/:bookID', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { bookID } = req.params;
        const [book]: any = await pool.query('SELECT title, author, total_copies, available_copies, description, isbn, category, rating FROM Books WHERE id = ?', [bookID]);

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
