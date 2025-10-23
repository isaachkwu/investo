import { RequestHandler } from "express";
import { verifyPromise } from "#utils/jwt.js";

import type { UserJwtPayload } from '#types/auth/UserJwtPayload.d.ts'
import { AppError } from "#utils/AppError.js";

const authMiddleware: RequestHandler = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Authorization header missing" });
    }
    const scheme = req.headers.authorization.split(" ")[0];
    if (scheme !== "Bearer") {
        return res.status(401).json({ message: "Invalid authorization scheme" });
    }
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }
    let decoded: UserJwtPayload;
    try {
        decoded = await verifyPromise(token, process.env.JWT_ACCESS_TOKEN_SECRET!, {}) as UserJwtPayload;
    } catch (err) {
        if (err instanceof Error && err.name === "TokenExpiredError") {
            throw new AppError(401, "Token has expired", "token_expired");
        }
        throw new AppError(401, "Invalid token", "invalid_token");
    }
    req.user = decoded;
        next();
};

export default authMiddleware;