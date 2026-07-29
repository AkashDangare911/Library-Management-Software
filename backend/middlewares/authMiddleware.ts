import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../utils/responseCodes.js';
import dotenv from 'dotenv';

dotenv.config();

// Extend the Express Request interface to include the decoded user payload
export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Extract the token from cookies
    const token = req.cookies?.auth_token;

    // 2. If there is no token, deny access
    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            error: "Access denied. No token provided.",
            success: false
        });
    }

    // 3. Verify the token using the secret key
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        // 4. Attach the decoded user data to the request object
        req.user = decoded;

        // 5. Call next() to pass control to the actual route handler (e.g., /borrow)
        next();
    } catch (err) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            error: "Invalid or expired token.",
            success: false
        });
    }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: "Access denied. Role not found.",
                success: false
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                error: "Access denied. Insufficient permissions.",
                success: false
            });
        }

        next();
    };
};
