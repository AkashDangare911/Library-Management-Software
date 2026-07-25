import express, { type Request, type Response } from "express";
import pool from "../db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, AUTH_MESSAGES } from "../utils/responseCodes.js";

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

        const jwt_token = jwt.sign({ id: userId, userEmail }, process.env.JWT_SECRET as string, { expiresIn: 3600 });
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
            });
    } catch (error) {
        console.error("Database error during registration:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: AUTH_MESSAGES.REGISTER_ERROR });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { userEmail, userPassword } = req.body;

    try {
        const [rows]: any = await pool.execute("SELECT id, password from Users where email=?", [userEmail])

        // no user with this email found
        if (rows.length === 0) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: AUTH_MESSAGES.USER_NOT_FOUND_ERROR, success: false });
        }

        // check if password is correct or not using bcrypt
        const isPasswordCorrect = await bcrypt.compare(userPassword, rows[0].password);

        // if password is correct, create token and send to frontend
        if (!isPasswordCorrect) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: AUTH_MESSAGES.WRONG_PASSWORD, success: false });
        }

        const jwt_token = jwt.sign({ id: rows[0].id, userEmail }, process.env.JWT_SECRET as string, { expiresIn: 3600 });
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
            });
    } catch (err) {
        console.error(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: AUTH_MESSAGES.SERVER_ERROR, success: false });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.status(HTTP_STATUS.OK).json({ message: "Logged out successfully", success: true });
});

export default router;
