import express, { type Request, type Response, type NextFunction } from 'express';
import pool from '../db.js';
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware.js';
import { HTTP_STATUS, REVIEW_MESSAGES } from '../utils/responseCodes.js';
import { BorrowStatus } from '../types/BorrowStatus.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

// GET all reviews for a book
router.get('/book/:bookId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookId } = req.params;
        const query = `
            SELECT r.*, u.name as user_name 
            FROM reviews r
            JOIN Users u ON r.user_id = u.id
            WHERE r.book_id = ?
            ORDER BY r.created_at DESC
        `;
        const [reviews]: any = await pool.query(query, [bookId]);
        res.status(HTTP_STATUS.OK).json(reviews);
    } catch (error) {
        next(new AppError(REVIEW_MESSAGES.FETCH_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

// GET user's own reviews
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userID = req.user?.id;
        const query = `
            SELECT r.*, b.title as book_title, b.author as book_author 
            FROM reviews r
            JOIN Books b ON r.book_id = b.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;
        const [reviews]: any = await pool.query(query, [userID]);
        res.status(HTTP_STATUS.OK).json(reviews);
    } catch (error) {
        next(new AppError(REVIEW_MESSAGES.FETCH_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

// POST a new review
router.post('/book/:bookId', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userID = req.user?.id;
        const { bookId } = req.params;
        const { rating, comment } = req.body;

        if (!userID) {
            return next(new AppError(REVIEW_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
        }

        if (!rating || rating < 1 || rating > 5) {
            return next(new AppError("Invalid rating.", HTTP_STATUS.BAD_REQUEST));
        }

        // 1. Check if user has borrowed the book (status is issued, returned, overdue)
        const [borrowings]: any = await pool.query(
            "SELECT id FROM borrowings WHERE user_id = ? AND book_id = ? AND status IN (?, ?, ?)",
            [userID, bookId, BorrowStatus.ISSUED, BorrowStatus.RETURNED, BorrowStatus.OVERDUE]
        );

        if (borrowings.length === 0) {
            return next(new AppError(REVIEW_MESSAGES.NOT_BORROWED, HTTP_STATUS.FORBIDDEN));
        }

        // 2. Check if review already exists
        const [existingReview]: any = await pool.query(
            "SELECT id FROM reviews WHERE user_id = ? AND book_id = ?",
            [userID, bookId]
        );

        if (existingReview.length > 0) {
            return next(new AppError(REVIEW_MESSAGES.REVIEW_EXISTS, HTTP_STATUS.BAD_REQUEST));
        }

        // 3. Insert review
        await pool.query(
            "INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)",
            [userID, bookId, rating, comment]
        );

        // 4. Update Book average rating
        const [avgResult]: any = await pool.query(
            "SELECT AVG(rating) as average_rating FROM reviews WHERE book_id = ?",
            [bookId]
        );

        const averageRating = avgResult[0].average_rating || 0;

        await pool.query(
            "UPDATE Books SET rating = ? WHERE id = ?",
            [averageRating, bookId]
        );

        res.status(HTTP_STATUS.CREATED).json({ message: REVIEW_MESSAGES.ADD_SUCCESS });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            next(new AppError(REVIEW_MESSAGES.REVIEW_EXISTS, HTTP_STATUS.BAD_REQUEST));
        } else {
            next(new AppError(REVIEW_MESSAGES.ADD_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
    }
});

// DELETE a review
router.delete('/:reviewId', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userID = req.user?.id;
        const userRole = req.user?.role;
        const { reviewId } = req.params;

        if (!userID) {
            return next(new AppError(REVIEW_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
        }

        // Find the review
        const [reviews]: any = await pool.query("SELECT * FROM reviews WHERE id = ?", [reviewId]);
        if (reviews.length === 0) {
            return next(new AppError(REVIEW_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        const review = reviews[0];

        // Check ownership or admin
        if (review.user_id !== userID && userRole !== 'admin' && userRole !== 'librarian') {
            return next(new AppError(REVIEW_MESSAGES.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN));
        }

        // Delete the review
        await pool.query("DELETE FROM reviews WHERE id = ?", [reviewId]);

        // Update Book average rating
        const [avgResult]: any = await pool.query(
            "SELECT AVG(rating) as average_rating FROM reviews WHERE book_id = ?",
            [review.book_id]
        );

        const averageRating = avgResult[0].average_rating || 0;

        await pool.query(
            "UPDATE Books SET rating = ? WHERE id = ?",
            [averageRating, review.book_id]
        );

        res.status(HTTP_STATUS.OK).json({ message: REVIEW_MESSAGES.DELETE_SUCCESS });
    } catch (error) {
        next(new AppError(REVIEW_MESSAGES.DELETE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

export default router;
