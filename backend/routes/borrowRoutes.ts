import express, { type Request, type Response, type NextFunction } from 'express';
import pool from '../db.js';
import { authenticateToken, authorizeRoles, type AuthRequest } from '../middlewares/authMiddleware.js';
import { HTTP_STATUS, BORROW_MESSAGES, BOOK_MESSAGES } from '../utils/responseCodes.js';
import { BorrowStatus } from '../types/BorrowStatus.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

router.post('/request', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userID = req.user?.id;
        const userRole = req.user?.role;
        const { bookID } = req.body;

        if (!userID || !bookID) {
            return next(new AppError(BORROW_MESSAGES.MISSING_ID, HTTP_STATUS.BAD_REQUEST));
        }

        if (userRole === 'admin' || userRole === 'librarian') {
            return next(new AppError(BORROW_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
        }

        const [books]: any = await pool.query('SELECT available_copies FROM Books WHERE id = ?', [bookID]);
        if (books.length === 0) {
            return next(new AppError(BOOK_MESSAGES.BOOK_NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }
        if (books[0].available_copies <= 0) {
            return next(new AppError(BORROW_MESSAGES.NO_COPIES, HTTP_STATUS.BAD_REQUEST));
        }

        const [totalActiveRequests]: any = await pool.query(
            "SELECT COUNT(id) as count FROM borrowings WHERE user_id = ? AND status IN (?, ?, ?, ?, ?)",
            [userID, BorrowStatus.PENDING, BorrowStatus.ACCEPTED, 'borrowed', BorrowStatus.ISSUED, BorrowStatus.OVERDUE]
        );
        if (totalActiveRequests[0].count >= 4) {
            return next(new AppError(BORROW_MESSAGES.LIMIT_REACHED, HTTP_STATUS.BAD_REQUEST));
        }

        const [activeRequests]: any = await pool.query(
            "SELECT id FROM borrowings WHERE user_id = ? AND book_id = ? AND status IN (?, ?, ?, ?, ?)",
            [userID, bookID, BorrowStatus.PENDING, BorrowStatus.ACCEPTED, 'borrowed', BorrowStatus.ISSUED, BorrowStatus.OVERDUE]
        );
        if (activeRequests.length > 0) {
            return next(new AppError(BORROW_MESSAGES.ALREADY_ACTIVE, HTTP_STATUS.BAD_REQUEST));
        }

        await pool.query(
            "INSERT INTO borrowings (user_id, book_id, status) VALUES (?, ?, ?)",
            [userID, bookID, BorrowStatus.PENDING]
        );

        res.status(HTTP_STATUS.CREATED).json({ message: BORROW_MESSAGES.SUBMIT_SUCCESS });
    } catch (error) {
        next(new AppError(BORROW_MESSAGES.SUBMIT_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userID = req.user?.id;

        const [borrowings]: any = await pool.query(`
            SELECT br.*, b.title, b.author 
            FROM borrowings br
            JOIN Books b ON br.book_id = b.id
            WHERE br.user_id = ?
            ORDER BY br.borrow_date DESC
        `, [userID]);

        res.status(HTTP_STATUS.OK).json(borrowings);
    } catch (error) {
        next(new AppError(BORROW_MESSAGES.FETCH_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.get('/all', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT br.*, b.title as book_title, u.name as user_name, u.email as user_email
            FROM borrowings br
            JOIN Books b ON br.book_id = b.id
            JOIN Users u ON br.user_id = u.id
        `;
        const params: any[] = [];

        if (status) {
            query += " WHERE br.status = ?";
            params.push(status);
        }

        query += " ORDER BY br.borrow_date DESC";

        const [borrowings]: any = await pool.query(query, params);
        res.status(HTTP_STATUS.OK).json(borrowings);
    } catch (error) {
        next(new AppError(BORROW_MESSAGES.FETCH_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.get('/book/:bookId', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookId } = req.params;
        const query = `
            SELECT br.*, u.name as user_name, u.email as user_email
            FROM borrowings br
            JOIN Users u ON br.user_id = u.id
            WHERE br.book_id = ?
            ORDER BY br.borrow_date DESC
        `;
        const [borrowings]: any = await pool.query(query, [bookId]);
        res.status(HTTP_STATUS.OK).json(borrowings);
    } catch (error) {
        next(new AppError(BORROW_MESSAGES.FETCH_BOOK_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id/accept', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const [borrowing]: any = await pool.query("SELECT book_id, status FROM borrowings WHERE id = ?", [id]);
        if (borrowing.length === 0) return next(new AppError(BORROW_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        if (borrowing[0].status !== BorrowStatus.PENDING) return next(new AppError(BORROW_MESSAGES.ONLY_PENDING_ACCEPT, HTTP_STATUS.BAD_REQUEST));

        const [updateBook]: any = await pool.query(
            "UPDATE Books SET available_copies = available_copies - 1 WHERE id = ? AND available_copies > 0",
            [borrowing[0].book_id]
        );
        if (updateBook.affectedRows === 0) {
            return next(new AppError(BORROW_MESSAGES.NO_COPIES_ACCEPT, HTTP_STATUS.BAD_REQUEST));
        }

        await pool.query(
            "UPDATE borrowings SET status = ?, accepted_at = CURRENT_TIMESTAMP WHERE id = ?",
            [BorrowStatus.ACCEPTED, id]
        );

        res.status(HTTP_STATUS.OK).json({ message: BORROW_MESSAGES.ACCEPT_SUCCESS });
    } catch (error) {
        next(new AppError(BORROW_MESSAGES.ACCEPT_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id/reject', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const [borrowing]: any = await pool.query("SELECT status FROM borrowings WHERE id = ?", [id]);
        if (borrowing.length === 0) return next(new AppError(BORROW_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        if (borrowing[0].status !== BorrowStatus.PENDING) return next(new AppError(BORROW_MESSAGES.ONLY_PENDING_REJECT, HTTP_STATUS.BAD_REQUEST));

        await pool.query(
            "UPDATE borrowings SET status = ?, rejection_reason = ? WHERE id = ?",
            [BorrowStatus.REJECTED, reason || null, id]
        );

        res.status(HTTP_STATUS.OK).json({ message: BORROW_MESSAGES.REJECT_SUCCESS });
    } catch (error) {
        next(new AppError(BORROW_MESSAGES.REJECT_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id/issue', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const [borrowing]: any = await pool.query("SELECT status FROM borrowings WHERE id = ?", [id]);
        if (borrowing.length === 0) return next(new AppError(BORROW_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        if (borrowing[0].status !== BorrowStatus.ACCEPTED) return next(new AppError(BORROW_MESSAGES.ONLY_ACCEPTED_ISSUE, HTTP_STATUS.BAD_REQUEST));

        await pool.query(
            "UPDATE borrowings SET status = ?, due_date = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 MONTH) WHERE id = ?",
            [BorrowStatus.ISSUED, id]
        );

        res.status(HTTP_STATUS.OK).json({ message: BORROW_MESSAGES.ISSUE_SUCCESS });
    } catch (error) {
        next(new AppError(BORROW_MESSAGES.ISSUE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id/return', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const [borrowings]: any = await pool.query("SELECT book_id, status, due_date FROM borrowings WHERE id = ?", [id]);
        if (borrowings.length === 0) return next(new AppError(BORROW_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        
        const borrowing = borrowings[0];
        if (borrowing.status !== BorrowStatus.ISSUED && borrowing.status !== BorrowStatus.OVERDUE) {
            return next(new AppError(`${BORROW_MESSAGES.ONLY_ISSUED_RETURN} ${borrowing.status}.`, HTTP_STATUS.BAD_REQUEST));
        }

        let penaltyAmount = 0;
        if (new Date() > new Date(borrowing.due_date)) {
            const daysOverdue = Math.ceil((new Date().getTime() - new Date(borrowing.due_date).getTime()) / (1000 * 3600 * 24));
            penaltyAmount = daysOverdue * 10;
        }

        await pool.query(
            "UPDATE Books SET available_copies = available_copies + 1 WHERE id = ?",
            [borrowing.book_id]
        );

        await pool.query(
            "UPDATE borrowings SET status = ?, return_date = CURRENT_TIMESTAMP, penalty_amount = ? WHERE id = ?",
            [BorrowStatus.RETURNED, penaltyAmount, id]
        );

        res.status(HTTP_STATUS.OK).json({
            message: BORROW_MESSAGES.RETURN_SUCCESS,
            penalty: penaltyAmount,
            isOverdue: penaltyAmount > 0
        });
    } catch (error) {
        next(new AppError(BORROW_MESSAGES.RETURN_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userID = req.user?.id;
        const borrowingID = req.params.id;

        if (!userID) {
            return next(new AppError(BOOK_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
        }

        const [borrowings]: any = await pool.query('SELECT * FROM borrowings WHERE id = ? AND user_id = ?', [borrowingID, userID]);
        if (borrowings.length === 0) {
            return next(new AppError(BORROW_MESSAGES.NOT_YOURS, HTTP_STATUS.NOT_FOUND));
        }

        const borrowing = borrowings[0];
        if (borrowing.status !== BorrowStatus.PENDING && borrowing.status !== BorrowStatus.ACCEPTED) {
            return next(new AppError(`${BORROW_MESSAGES.ONLY_PENDING_CANCEL} ${borrowing.status}.`, HTTP_STATUS.BAD_REQUEST));
        }

        await pool.query('UPDATE borrowings SET status = ? WHERE id = ?', [BorrowStatus.CANCELLED, borrowingID]);

        if (borrowing.status === BorrowStatus.ACCEPTED) {
            await pool.query('UPDATE Books SET available_copies = available_copies + 1 WHERE id = ?', [borrowing.book_id]);
        }

        return res.json({ message: BORROW_MESSAGES.CANCEL_SUCCESS });
    } catch (error) {
        next(new AppError(BORROW_MESSAGES.CANCEL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});

export default router;
