import express, { type Request, type Response } from "express";
import pool from "../db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { HTTP_STATUS, AUTH_MESSAGES } from "../utils/responseCodes.js";

dotenv.config();
const SALT_ROUNDS = 10;

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    const { userName, userEmail, userPassword } = req.body;

    const hashedPassword = await bcrypt.hash(userPassword, SALT_ROUNDS);
    try {
        await pool.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [userName, userEmail, hashedPassword]
        );

        res.status(HTTP_STATUS.CREATED).json({ message: AUTH_MESSAGES.REGISTER_SUCCESS });
    } catch (error) {
        console.error("Database error during registration:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: AUTH_MESSAGES.REGISTER_ERROR });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { userEmail, userPassword } = req.body;

    try {
        const [rows]: any = await pool.execute("SELECT password from Users where email=?", [userEmail])

        if (rows.length === 0) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: AUTH_MESSAGES.INVALID_CREDENTIALS, success: false });
        }

        const isPasswordCorrect = await bcrypt.compare(userPassword, rows[0].password);
        if (!isPasswordCorrect) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: AUTH_MESSAGES.INVALID_CREDENTIALS, success: false });
        }

        res.status(HTTP_STATUS.OK).json({ message: AUTH_MESSAGES.LOGIN_SUCCESS, success: true });
    } catch (err) {
        console.error(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: AUTH_MESSAGES.SERVER_ERROR, success: false });
    }
})

export default router;
