import express, { type Request, type Response } from 'express';
import pool from '../db.js';
import { authenticateToken, authorizeRoles, type AuthRequest } from '../middlewares/authMiddleware.js';
import { HTTP_STATUS } from '../utils/responseCodes.js';
import { BorrowStatus } from '../types/BorrowStatus.js';

const router = express.Router();

// User: Request to borrow a book
router.post('/request', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.user?.id;
        const userRole = req.user?.role;
        const { bookID } = req.body;

        if (!userID || !bookID) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Missing user or book ID" });
        }

        if (userRole === 'admin' || userRole === 'librarian') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ error: "Admins and Librarians cannot borrow books." });
        }

        // Check if book is available
        const [books]: any = await pool.query('SELECT available_copies FROM Books WHERE id = ?', [bookID]);
        if (books.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Book not found" });
        }
        if (books[0].available_copies <= 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No copies available" });
        }

        // Check total active borrowings for the user
        const [totalActiveRequests]: any = await pool.query(
            "SELECT COUNT(id) as count FROM borrowings WHERE user_id = ? AND status IN (?, ?, ?, ?, ?)",
            [userID, BorrowStatus.PENDING, BorrowStatus.ACCEPTED, 'borrowed', BorrowStatus.ISSUED, BorrowStatus.OVERDUE]
        );
        if (totalActiveRequests[0].count >= 4) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "You have reached the maximum limit of 4 active borrowings." });
        }

        // Check if user already has an active request for this book
        const [activeRequests]: any = await pool.query(
            "SELECT id FROM borrowings WHERE user_id = ? AND book_id = ? AND status IN (?, ?, ?, ?, ?)",
            [userID, bookID, BorrowStatus.PENDING, BorrowStatus.ACCEPTED, 'borrowed', BorrowStatus.ISSUED, BorrowStatus.OVERDUE]
        );
        if (activeRequests.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "You already have an active request or borrowing for this book" });
        }

        // Create pending request
        await pool.query(
            "INSERT INTO borrowings (user_id, book_id, status) VALUES (?, ?, ?)",
            [userID, bookID, BorrowStatus.PENDING]
        );

        res.status(HTTP_STATUS.CREATED).json({ message: "Borrow request submitted" });
    } catch (error) {
        console.error("Error creating borrow request:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to request book" });
    }
});

// User: Get my borrowings
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.user?.id;

        // JOIN the tables
        const [borrowings]: any = await pool.query(`
            SELECT br.*, b.title, b.author 
            FROM borrowings br
            JOIN Books b ON br.book_id = b.id
            WHERE br.user_id = ?
            ORDER BY br.borrow_date DESC
        `, [userID]);

        res.status(HTTP_STATUS.OK).json(borrowings);
    } catch (error) {
        console.error("Error fetching user borrowings:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch borrowings" });
    }
});

// Librarian: Get all borrowings/requests (can filter by status)
router.get('/all', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response) => {
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
        console.error("Error fetching all borrowings:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch borrowings" });
    }
});

// Librarian: Accept request
router.put('/:id/accept', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [borrowing]: any = await pool.query("SELECT book_id, status FROM borrowings WHERE id = ?", [id]);
        if (borrowing.length === 0) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Request not found" });
        if (borrowing[0].status !== BorrowStatus.PENDING) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Only pending requests can be accepted" });

        // Decrement copies
        const [updateBook]: any = await pool.query(
            "UPDATE Books SET available_copies = available_copies - 1 WHERE id = ? AND available_copies > 0",
            [borrowing[0].book_id]
        );
        if (updateBook.affectedRows === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No copies available to accept this request" });
        }

        await pool.query(
            "UPDATE borrowings SET status = ?, accepted_at = CURRENT_TIMESTAMP WHERE id = ?",
            [BorrowStatus.ACCEPTED, id]
        );

        res.status(HTTP_STATUS.OK).json({ message: "Request accepted. Book reserved for 24 hours." });
    } catch (error) {
        console.error("Error accepting request:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to accept request" });
    }
});

// Librarian: Reject request
router.put('/:id/reject', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const [borrowing]: any = await pool.query("SELECT status FROM borrowings WHERE id = ?", [id]);
        if (borrowing.length === 0) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Request not found" });
        if (borrowing[0].status !== BorrowStatus.PENDING) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Only pending requests can be rejected" });

        await pool.query(
            "UPDATE borrowings SET status = ?, rejection_reason = ? WHERE id = ?",
            [BorrowStatus.REJECTED, reason || null, id]
        );

        res.status(HTTP_STATUS.OK).json({ message: "Request rejected." });
    } catch (error) {
        console.error("Error rejecting request:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to reject request" });
    }
});

// Librarian: Issue book
router.put('/:id/issue', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [borrowing]: any = await pool.query("SELECT status FROM borrowings WHERE id = ?", [id]);
        if (borrowing.length === 0) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Request not found" });
        if (borrowing[0].status !== BorrowStatus.ACCEPTED) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Only accepted requests can be issued" });

        // Issue for 1 month
        await pool.query(
            "UPDATE borrowings SET status = ?, due_date = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 MONTH) WHERE id = ?",
            [BorrowStatus.ISSUED, id]
        );

        res.status(HTTP_STATUS.OK).json({ message: "Book issued." });
    } catch (error) {
        console.error("Error issuing book:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to issue book" });
    }
});

// Librarian: Return book
router.put('/:id/return', authenticateToken, authorizeRoles('librarian', 'admin'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [borrowings]: any = await pool.query("SELECT book_id, status, due_date FROM borrowings WHERE id = ?", [id]);
        if (borrowings.length === 0) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Request not found" });
        
        const borrowing = borrowings[0];
        if (borrowing.status !== BorrowStatus.ISSUED && borrowing.status !== BorrowStatus.OVERDUE) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `Cannot return a book that is ${borrowing.status}.` });
        }

        // Calculate penalty if any
        let penaltyAmount = 0;
        if (new Date() > new Date(borrowing.due_date)) {
            const daysOverdue = Math.ceil((new Date().getTime() - new Date(borrowing.due_date).getTime()) / (1000 * 3600 * 24));
            penaltyAmount = daysOverdue * 10;
        }

        // Increment copies
        await pool.query(
            "UPDATE Books SET available_copies = available_copies + 1 WHERE id = ?",
            [borrowing.book_id]
        );

        await pool.query(
            "UPDATE borrowings SET status = ?, return_date = CURRENT_TIMESTAMP, penalty_amount = ? WHERE id = ?",
            [BorrowStatus.RETURNED, penaltyAmount, id]
        );

        res.status(HTTP_STATUS.OK).json({
            message: "Book returned.",
            penalty: penaltyAmount,
            isOverdue: penaltyAmount > 0
        });
    } catch (error) {
        console.error("Error returning book:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to return book" });
    }
});
// User: Cancel a borrow request
router.put('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.user?.id;
        const borrowingID = req.params.id;

        if (!userID) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized" });
        }

        const [borrowings]: any = await pool.query('SELECT * FROM borrowings WHERE id = ? AND user_id = ?', [borrowingID, userID]);
        if (borrowings.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Borrowing record not found or does not belong to you." });
        }

        const borrowing = borrowings[0];
        if (borrowing.status !== BorrowStatus.PENDING && borrowing.status !== BorrowStatus.ACCEPTED) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `Cannot cancel a request that is already ${borrowing.status}.` });
        }

        await pool.query('UPDATE borrowings SET status = ? WHERE id = ?', [BorrowStatus.CANCELLED, borrowingID]);

        // If it was accepted, we need to return the reserved copy back to the available pool
        if (borrowing.status === BorrowStatus.ACCEPTED) {
            await pool.query('UPDATE Books SET available_copies = available_copies + 1 WHERE id = ?', [borrowing.book_id]);
        }

        return res.json({ message: "Request cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling request:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to cancel request" });
    }
});

export default router;
