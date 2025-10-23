import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '#db/database.js';
import { z, ZodError } from 'zod';
import { registerSchema } from '#schema/auth.schema.js';
import { AppError } from '#utils/AppError.js';
import { SignOptions } from 'jsonwebtoken';
import { signPromise } from '#utils/jwt.js';
import { UserJwtPayload } from '#types/auth/UserJwtPayload.js';

const registerRoute: RequestHandler = async (req, res) => {
    // Validate input
    const { email, name, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db
        .selectFrom('appUser')
        .where('email', '=', email)
        .executeTakeFirst();

    if (existingUser) {
        throw new AppError(
            400,
            'Email already registered',
            'email_already_registered',
        );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const newUser = await db
        .insertInto('appUser')
        .values({
            email,
            name,
            passwordHash: hashedPassword,
        })
        .returningAll()
        .executeTakeFirst();

    if (!newUser) {
        throw new AppError(
            500,
            'Failed to create user',
            'user_creation_failed',
        );
    }

    const payload: UserJwtPayload = {
        userId: String(newUser.userId),
        email: newUser.email,
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
        (process.env.ACCESS_TOKEN_TTL as SignOptions['expiresIn']) || '15m';

    // Issue a new access token. Adjust payload fields and sign options as needed.
    const accessToken = await signPromise(
        { ...payload, type: 'access' },
        jwt_access_secret,
        { expiresIn: jwt_access_expires_in },
    );

    return res.json({ refreshToken: refreshToken, accessToken: accessToken });
};

export default registerRoute;
