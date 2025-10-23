import { ErrorRequestHandler } from "express";
import { AppError } from "#utils/AppError.js";

const errorMiddleware: ErrorRequestHandler = async (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            code: err.code,
            message: err.message
        })
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ status: 'error', code: 'internal_server_error', message: "Internal server error" });
}

export default errorMiddleware;
