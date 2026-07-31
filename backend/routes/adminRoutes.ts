import express, { type Request, type Response } from 'express';
import pool from '../db.js';
import { HTTP_STATUS } from '../utils/responseCodes.js';
import { authenticateToken, authorizeRoles, type AuthRequest } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /admin/stats - High-level KPIs (Admin only)
router.get('/stats', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
    try {
        const [userCountResult]: any = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'member'");
        const totalUsers = userCountResult[0].count;

        const [bookStatsResult]: any = await pool.query("SELECT COUNT(id) as total_titles, SUM(total_copies) as total_copies FROM books");
        const totalTitles = bookStatsResult[0].total_titles || 0;
        const totalCopies = bookStatsResult[0].total_copies || 0;

        const [circulationResult]: any = await pool.query("SELECT COUNT(*) as issued_books FROM borrowings WHERE status = 'issued'");
        const issuedBooks = circulationResult[0].issued_books;

        const [revenueResult]: any = await pool.query("SELECT SUM(penalty_amount) as total_revenue FROM borrowings");
        const totalRevenue = revenueResult[0].total_revenue || 0;

        res.status(HTTP_STATUS.OK).json({
            totalUsers,
            totalTitles,
            totalCopies,
            issuedBooks,
            totalRevenue
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch stats" });
    }
});

// GET /admin/settings - Get settings (Admin only)
router.get('/settings', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
    try {
        const [rows]: any = await pool.query("SELECT setting_key, setting_value FROM settings");
        const settings = rows.reduce((acc: any, row: any) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});
        res.status(HTTP_STATUS.OK).json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch settings" });
    }
});

// PUT /admin/settings - Update settings (Admin only)
router.put('/settings', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?", 
                [key, String(value), String(value)]
            );
        }
        res.status(HTTP_STATUS.OK).json({ message: "Settings updated successfully" });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to update settings" });
    }
});

// GET /admin/borrowings - Get all borrowing history (Admin only)
router.get('/borrowings', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
    try {
        const query = `
            SELECT b.*, u.name as user_name, u.email as user_email, bk.title as book_title
            FROM borrowings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN books bk ON b.book_id = bk.id
            ORDER BY b.borrow_date DESC
        `;
        const [rows]: any = await pool.query(query);
        res.status(HTTP_STATUS.OK).json(rows);
    } catch (error) {
        console.error("Error fetching all borrowings:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch borrowing history" });
    }
});

export default router;
