import express, { type Request, type Response, type NextFunction } from 'express';
import pool from '../db.js';
import { HTTP_STATUS, BOOK_MESSAGES } from '../utils/responseCodes.js';
import { authenticateToken, authorizeRoles, type AuthRequest } from '../middlewares/authMiddleware.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search, category, rating, available, page, limit, sort } = req.query;

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

        const countQuery = 'SELECT COUNT(*) as total' + baseQuery;
        const [countResult]: any = await pool.query(countQuery, params);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const dataQuery = 'SELECT *' + baseQuery + orderClause + ' LIMIT ? OFFSET ?';
        const dataParams = [...params, itemsPerPage, offset];

        const [rows] = await pool.query(dataQuery, dataParams);

        res.status(HTTP_STATUS.OK).json({
            books: rows,
            totalItems,
            totalPages,
            currentPage
        });
    } catch (error) {
        next(new AppError(BOOK_MESSAGES.FETCH_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.get('/me/favorites', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            return next(new AppError(BOOK_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
        }

        const [rows]: any = await pool.query('SELECT book_id FROM favorites WHERE user_id = ?', [userID]);
        const favoriteBookIDs = rows.map((row: any) => row.book_id);

        res.status(HTTP_STATUS.OK).json(favoriteBookIDs);
    } catch (error) {
        next(new AppError(BOOK_MESSAGES.FAVORITE_FETCH_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.post('/:bookID/favorite', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userID = req.user?.id;
        const { bookID } = req.params;

        if (!userID) {
            return next(new AppError(BOOK_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
        }

        const [book]: any = await pool.query('SELECT id FROM books WHERE id = ?', [bookID]);
        if (book.length === 0) {
            return next(new AppError(BOOK_MESSAGES.BOOK_NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        const [existing]: any = await pool.query('SELECT * FROM favorites WHERE user_id = ? AND book_id = ?', [userID, bookID]);

        if (existing.length > 0) {
            await pool.query('DELETE FROM favorites WHERE user_id = ? AND book_id = ?', [userID, bookID]);
            return res.status(HTTP_STATUS.OK).json({ message: BOOK_MESSAGES.FAVORITE_REMOVED, isFavorite: false });
        } else {
            await pool.query('INSERT INTO favorites (user_id, book_id) VALUES (?, ?)', [userID, bookID]);
            return res.status(HTTP_STATUS.OK).json({ message: BOOK_MESSAGES.FAVORITE_ADDED, isFavorite: true });
        }
    } catch (error) {
        next(new AppError(BOOK_MESSAGES.TOGGLE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.get('/:bookID', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { bookID } = req.params;
        const [book]: any = await pool.query('SELECT id, title, author, total_copies, available_copies, description, isbn, category, rating FROM Books WHERE id = ?', [bookID]);

        if (book.length === 0) {
            return next(new AppError(BOOK_MESSAGES.BOOK_NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json(book[0]);
    } catch (error) {
        next(new AppError(BOOK_MESSAGES.FETCH_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.post('/', authenticateToken, authorizeRoles('admin', 'librarian'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { title, author, description, total_copies, isbn, category } = req.body;
        const available_copies = total_copies; 
        const rating = 0; 

        const [result]: any = await pool.query(
            'INSERT INTO books (title, author, description, total_copies, available_copies, isbn, category, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, author, description, total_copies, available_copies, isbn, category, rating]
        );

        res.status(HTTP_STATUS.CREATED).json({ message: BOOK_MESSAGES.ADD_SUCCESS, bookId: result.insertId });
    } catch (error) {
        next(new AppError(BOOK_MESSAGES.ADD_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:bookID', authenticateToken, authorizeRoles('admin', 'librarian'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { bookID } = req.params;
        const { title, author, description, total_copies, isbn, category } = req.body;

        const [books]: any = await pool.query('SELECT total_copies, available_copies FROM books WHERE id = ?', [bookID]);
        if (books.length === 0) {
            return next(new AppError(BOOK_MESSAGES.BOOK_NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        const book = books[0];
        const copiesDiff = total_copies - book.total_copies;
        const newAvailableCopies = book.available_copies + copiesDiff;

        if (newAvailableCopies < 0) {
            return next(new AppError(BOOK_MESSAGES.COPIES_ERROR, HTTP_STATUS.BAD_REQUEST));
        }

        await pool.query(
            'UPDATE books SET title = ?, author = ?, description = ?, total_copies = ?, available_copies = ?, isbn = ?, category = ? WHERE id = ?',
            [title, author, description, total_copies, newAvailableCopies, isbn, category, bookID]
        );

        res.status(HTTP_STATUS.OK).json({ message: BOOK_MESSAGES.UPDATE_SUCCESS });
    } catch (error) {
        next(new AppError(BOOK_MESSAGES.UPDATE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.delete('/:bookID', authenticateToken, authorizeRoles('admin', 'librarian'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { bookID } = req.params;

        const [result]: any = await pool.query('DELETE FROM books WHERE id = ?', [bookID]);
        
        if (result.affectedRows === 0) {
            return next(new AppError(BOOK_MESSAGES.BOOK_NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({ message: BOOK_MESSAGES.DELETE_SUCCESS });
    } catch (error) {
        next(new AppError(BOOK_MESSAGES.DELETE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

export default router;
