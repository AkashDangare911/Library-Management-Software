import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../utils/responseCodes.js';

export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong on the server';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else {
        // Log unexpected errors
        console.error('Unexpected Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};
