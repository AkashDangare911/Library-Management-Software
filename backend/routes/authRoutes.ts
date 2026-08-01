import express, { type Request, type Response, type NextFunction } from "express";
import pool from "../db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, AUTH_MESSAGES } from "../utils/responseCodes.js";
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware.js';
import { AppError } from "../utils/AppError.js";

dotenv.config();
const SALT_ROUNDS = 10;
const router = express.Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    const { userName, userEmail, userPassword } = req.body;

    try {
        const [row]: any = await pool.execute("SELECT count(*) as count from Users where email = ?", [userEmail]);
        if (row[0].count > 0) {
            throw new AppError(AUTH_MESSAGES.USER_ALREADY_REGISTERED_ERROR, HTTP_STATUS.UNAUTHORIZED);
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
        next(error);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    const { userEmail, userPassword } = req.body;

    try {
        const [rows]: any = await pool.execute("SELECT id, name, email, password, role from Users where email=?", [userEmail])

        if (rows.length === 0) {
            throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND_ERROR, HTTP_STATUS.UNAUTHORIZED);
        }

        const user = rows[0];
        const isPasswordCorrect = await bcrypt.compare(userPassword, user.password);

        if (!isPasswordCorrect) {
            throw new AppError(AUTH_MESSAGES.WRONG_PASSWORD, HTTP_STATUS.UNAUTHORIZED);
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
        next(err);
    }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userID = req.user?.id;
    if (!userID) {
        return next(new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED));
    }

    try {
        const [rows]: any = await pool.execute("SELECT id, name, email, role FROM Users WHERE id = ?", [userID]);
        if (rows.length === 0) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
        }

        const user = rows[0];
        res.status(HTTP_STATUS.OK).json({ success: true, user });
    } catch (err) {
        next(err);
    }
});

router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.status(HTTP_STATUS.OK).json({ message: "Logged out successfully", success: true });
});

router.put('/reset-password', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userID = req.user?.id;
    const userEmail = req.user?.userEmail;
    const { currentPassword, newPassword } = req.body;

    if (!userID || !userEmail) {
        return next(new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED));
    }

    try {
        const [rows]: any = await pool.execute("SELECT password FROM users WHERE id = ?", [userID]);
        if (rows.length === 0) {
            throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
        }

        const storedHash = rows[0].password;
        const isPasswordCorrect = await bcrypt.compare(currentPassword, storedHash);
        
        if (!isPasswordCorrect) {
            throw new AppError("Incorrect current password", HTTP_STATUS.UNAUTHORIZED);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userID]);

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
        next(err);
    }
});

export default router;
