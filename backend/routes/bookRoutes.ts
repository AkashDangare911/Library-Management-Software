import express, { type Request, type Response } from 'express';
import pool from '../db.js'; // Note the .js for ESM

import { HTTP_STATUS, BOOK_MESSAGES } from '../utils/responseCodes.js';
import { authenticateToken, authorizeRoles, type AuthRequest } from '../middlewares/authMiddleware.js';

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

// GET /books/me/favorites - Get all favorite book IDs for logged in user
router.get('/me/favorites', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized" });
        }

        const [rows]: any = await pool.query('SELECT book_id FROM favorites WHERE user_id = ?', [userID]);
        const favoriteBookIDs = rows.map((row: any) => row.book_id);

        res.status(HTTP_STATUS.OK).json(favoriteBookIDs);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch favorites" });
    }
});

// POST /books/:bookID/favorite - Toggle favorite status
router.post('/:bookID/favorite', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.user?.id;
        const { bookID } = req.params;

        if (!userID) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized" });
        }

        // Check if book exists
        const [book]: any = await pool.query('SELECT id FROM books WHERE id = ?', [bookID]);
        if (book.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Book not found" });
        }

        // Check if already favorited
        const [existing]: any = await pool.query('SELECT * FROM favorites WHERE user_id = ? AND book_id = ?', [userID, bookID]);

        if (existing.length > 0) {
            // Remove from favorites
            await pool.query('DELETE FROM favorites WHERE user_id = ? AND book_id = ?', [userID, bookID]);
            return res.status(HTTP_STATUS.OK).json({ message: "Book removed from favorites", isFavorite: false });
        } else {
            // Add to favorites
            await pool.query('INSERT INTO favorites (user_id, book_id) VALUES (?, ?)', [userID, bookID]);
            return res.status(HTTP_STATUS.OK).json({ message: "Book added to favorites", isFavorite: true });
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to toggle favorite" });
    }
});

router.get('/:bookID', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { bookID } = req.params;
        const [book]: any = await pool.query('SELECT id, title, author, total_copies, available_copies, description, isbn, category, rating FROM Books WHERE id = ?', [bookID]);

        if (book.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Book not found" });
        }

        res.status(HTTP_STATUS.OK).json(book[0]);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: BOOK_MESSAGES.FETCH_ERROR });
    }
});

// POST /books - Add a new book (Admin & Librarian)
router.post('/', authenticateToken, authorizeRoles('admin', 'librarian'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, author, description, total_copies, isbn, category } = req.body;
        const available_copies = total_copies; // initially all are available
        const rating = 0; // default rating

        const [result]: any = await pool.query(
            'INSERT INTO books (title, author, description, total_copies, available_copies, isbn, category, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, author, description, total_copies, available_copies, isbn, category, rating]
        );

        res.status(HTTP_STATUS.CREATED).json({ message: "Book added successfully", bookId: result.insertId });
    } catch (error) {
        console.error("Error adding book:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to add book" });
    }
});

// PUT /books/:bookID - Update a book (Admin & Librarian)
router.put('/:bookID', authenticateToken, authorizeRoles('admin', 'librarian'), async (req: AuthRequest, res: Response) => {
    try {
        const { bookID } = req.params;
        const { title, author, description, total_copies, isbn, category } = req.body;

        // First calculate the difference in total_copies to update available_copies correctly
        const [books]: any = await pool.query('SELECT total_copies, available_copies FROM books WHERE id = ?', [bookID]);
        if (books.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Book not found" });
        }

        const book = books[0];
        const copiesDiff = total_copies - book.total_copies;
        const newAvailableCopies = book.available_copies + copiesDiff;

        if (newAvailableCopies < 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Cannot reduce total copies below currently issued copies" });
        }

        const [result]: any = await pool.query(
            'UPDATE books SET title = ?, author = ?, description = ?, total_copies = ?, available_copies = ?, isbn = ?, category = ? WHERE id = ?',
            [title, author, description, total_copies, newAvailableCopies, isbn, category, bookID]
        );

        res.status(HTTP_STATUS.OK).json({ message: "Book updated successfully" });
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to update book" });
    }
});

// DELETE /books/:bookID - Delete a book (Admin & Librarian)
router.delete('/:bookID', authenticateToken, authorizeRoles('admin', 'librarian'), async (req: AuthRequest, res: Response) => {
    try {
        const { bookID } = req.params;

        const [result]: any = await pool.query('DELETE FROM books WHERE id = ?', [bookID]);
        
        if (result.affectedRows === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Book not found" });
        }

        res.status(HTTP_STATUS.OK).json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to delete book" });
    }
});

export default router;
