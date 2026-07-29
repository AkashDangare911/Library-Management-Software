import express, { type Request, type Response } from "express";
import pool from "../db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, AUTH_MESSAGES } from "../utils/responseCodes.js";
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware.js';

dotenv.config();
const SALT_ROUNDS = 10;
const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    const { userName, userEmail, userPassword } = req.body;

    try {
        const [row]: any = await pool.execute("SELECT count(*) as count from Users where email = ?", [userEmail]);
        if (row[0].count > 0) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: AUTH_MESSAGES.USER_ALREADY_REGISTERED_ERROR, success: false });
        }

        const hashedPassword = await bcrypt.hash(userPassword, SALT_ROUNDS);
        const [result]: any = await pool.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [userName, userEmail, hashedPassword]
        );
        const userId = result.insertId;

        const jwt_token = jwt.sign({ id: userId, userEmail, role: 'member' }, process.env.JWT_SECRET as string, { expiresIn: 3600 });
        res.cookie('auth_token', jwt_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });
        res.status(HTTP_STATUS.CREATED)
            .json({
                message: AUTH_MESSAGES.REGISTER_SUCCESS,
                success: true,
                user: {
                    id: userId,
                    name: userName,
                    email: userEmail,
                    role: 'member'
                }
            });
    } catch (error) {
        console.error("Database error during registration:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: AUTH_MESSAGES.REGISTER_ERROR });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { userEmail, userPassword } = req.body;

    try {
        const [rows]: any = await pool.execute("SELECT id, name, email, password, role from Users where email=?", [userEmail])

        // no user with this email found
        if (rows.length === 0) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: AUTH_MESSAGES.USER_NOT_FOUND_ERROR, success: false });
        }

        const user = rows[0];

        // check if password is correct or not using bcrypt
        const isPasswordCorrect = await bcrypt.compare(userPassword, user.password);

        // if password is correct, create token and send to frontend
        if (!isPasswordCorrect) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: AUTH_MESSAGES.WRONG_PASSWORD, success: false });
        }

        const jwt_token = jwt.sign(
            { id: user.id, userEmail: user.email, role: user.role }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: 3600 }
        );

        res.cookie('auth_token', jwt_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });
        
        res.status(HTTP_STATUS.OK)
            .json({
                message: AUTH_MESSAGES.LOGIN_SUCCESS,
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
    } catch (err) {
        console.error(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: AUTH_MESSAGES.SERVER_ERROR, success: false });
    }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userID = req.user?.id;
    if (!userID) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized", success: false });
    }

    try {
        const [rows]: any = await pool.execute("SELECT id, name, email, role FROM Users WHERE id = ?", [userID]);
        if (rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User not found", success: false });
        }

        const user = rows[0];
        res.status(HTTP_STATUS.OK).json({ success: true, user });
    } catch (err) {
        console.error("Database error during /me:", err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Server error", success: false });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.status(HTTP_STATUS.OK).json({ message: "Logged out successfully", success: true });
});

router.put('/reset-password', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userID = req.user?.id;
    const userEmail = req.user?.userEmail;
    const { currentPassword, newPassword } = req.body;

    if (!userID || !userEmail) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized", success: false });
    }

    try {
        // 1. Fetch current password hash from DB
        const [rows]: any = await pool.execute("SELECT password FROM users WHERE id = ?", [userID]);
        if (rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User not found", success: false });
        }

        const storedHash = rows[0].password;

        // 2. Compare current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, storedHash);
        if (!isPasswordCorrect) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Incorrect current password", success: false });
        }

        // 3. Hash new password and update
        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userID]);

        // 4. Issue a new JWT token to extend the session and keep things fresh
        // we use req.user.role if available, else default to member or fetch from DB
        const role = req.user?.role || 'member'; 
        const jwt_token = jwt.sign({ id: userID, userEmail, role }, process.env.JWT_SECRET as string, { expiresIn: 3600 });
        res.cookie('auth_token', jwt_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });

        res.status(HTTP_STATUS.OK).json({ message: "Password updated successfully", success: true });

    } catch (err) {
        console.error("Database error during password reset:", err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to reset password", success: false });
    }
});

export default router;
