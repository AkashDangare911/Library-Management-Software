import express, { type Request, type Response } from 'express';
import pool from '../db.js';
import { HTTP_STATUS } from '../utils/responseCodes.js';
import { authenticateToken, authorizeRoles, type AuthRequest } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /users - Get all users (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.status(HTTP_STATUS.OK).json(rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch users" });
    }
});

// PUT /users/:id/role - Update user role (Admin only)
router.put('/:id/role', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['member', 'librarian', 'admin'].includes(role)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid role" });
        }

        const [result]: any = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        
        if (result.affectedRows === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User not found" });
        }

        res.status(HTTP_STATUS.OK).json({ message: "User role updated successfully" });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to update user role" });
    }
});

// DELETE /users/:id - Delete a user (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (req.user?.id === parseInt(id)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Cannot delete your own account" });
        }

        const [result]: any = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User not found" });
        }

        res.status(HTTP_STATUS.OK).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to delete user" });
    }
});

export default router;
