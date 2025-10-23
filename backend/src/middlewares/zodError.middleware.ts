import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

const zodErrorMiddleware: ErrorRequestHandler = async (err, req, res, next) => {
    if (err instanceof ZodError) {
        console.log('Handling ZodError with issues:', err.issues);
        res.status(400).json({
            status: 'error',
            code: 'validation_error',
            errors: err.issues.map((issue) => ({
                path: issue.path,
                message: issue.message,
            })),
        });
    } else {
        next(err);
    }
}

export default zodErrorMiddleware;
