import express, { type Request, type Response, type NextFunction } from 'express';
import pool from '../db.js';
import { HTTP_STATUS } from '../utils/responseCodes.js';
import { authenticateToken, authorizeRoles, type AuthRequest } from '../middlewares/authMiddleware.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const [rows]: any = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.status(HTTP_STATUS.OK).json(rows);
    } catch (error) {
        next(error);
    }
});

router.put('/:id/role', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['member', 'librarian', 'admin'].includes(role)) {
            return next(new AppError("Invalid role", HTTP_STATUS.BAD_REQUEST));
        }

        const [result]: any = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        
        if (result.affectedRows === 0) {
            return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({ message: "User role updated successfully" });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (req.user?.id === parseInt(id)) {
            return next(new AppError("Cannot delete your own account", HTTP_STATUS.BAD_REQUEST));
        }

        const [result]: any = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({ message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
});

export default router;
