import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { signPromise } from '#utils/jwt.js';
import { db } from '#db/database.js';
import { SignOptions } from 'jsonwebtoken';
import type { UserJwtPayload } from '#types/auth/UserJwtPayload.d.ts';
import { loginSchema } from '#schema/auth.schema.js';
import { AppError } from '#utils/AppError.js';

const loginRoute = async (req: Request, res: Response) => {
    // validate input
    const { email, password } = loginSchema.parse(req.body);

    // fetch user hashed password from DB
    const user = await db
        .selectFrom('appUser')
        .select(['userId', 'email', 'passwordHash'])
        .where('email', '=', email)
        .executeTakeFirst();

    if (!user) {
        throw new AppError(
            401,
            'Invalid email or password',
            'invalid_credentials',
        );
    }

    // verify password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        throw new AppError(
            401,
            'Invalid email or password',
            'invalid_credentials',
        );
    }

    // build payload and sign JWT
    const payload: UserJwtPayload = {
        userId: String(user.userId),
        email: user.email,
        type: 'refresh',
    };

    const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
    if (!secret) {
        console.error('JWT_REFRESH_TOKEN_SECRET not defined');
        throw new AppError(
            500,
            'Server configuration error',
            'server_configuration_error',
        );
    }
    const refreshTokenExpiresIn =
        (process.env
            .REFRESH_TOKEN_TTL as SignOptions['expiresIn']) || '7d';
    const refreshToken = await signPromise({...payload, type: 'refresh'}, secret, {
        expiresIn: refreshTokenExpiresIn,
    });

    const jwt_access_secret = process.env.JWT_ACCESS_TOKEN_SECRET;
    if (!jwt_access_secret) {
        console.error('JWT_ACCESS_TOKEN_SECRET not defined');
        throw new AppError(
            500,
            'Server configuration error',
            'server_configuration_error',
        );
    }

    const jwt_access_expires_in =
        (process.env.ACCESS_TOKEN_TTL as SignOptions['expiresIn']) ||
        '15m';

    // Issue a new access token. Adjust payload fields and sign options as needed.
    const accessToken = await signPromise(
        { ...payload, type: 'access' },
        jwt_access_secret,
        { expiresIn: jwt_access_expires_in },
    );

    return res.json({ refreshToken: refreshToken, accessToken: accessToken });
};

export default loginRoute;
