import { Request, Response } from 'express';
import { verifyPromise, signPromise } from '#utils/jwt.js';
import { SignOptions } from 'jsonwebtoken';
import { AppError } from '#utils/AppError.js';

const refreshRoute = async (req: Request, res: Response) => {
    const authHeader = req.get('Authorization') || req.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(
            401,
            'Invalid or missing Authorization header',
            'invalid_authorization_header',
        );
    }

    const refreshToken = authHeader.slice('Bearer '.length).trim();

    const jwt_refresh_secret = process.env.JWT_REFRESH_TOKEN_SECRET;
    if (!jwt_refresh_secret) {
        console.error('JWT_REFRESH_TOKEN_SECRET not defined');
        throw new AppError(
            500,
            'Server configuration error',
            'server_configuration_error',
        );
    }

    // Verify the refresh token
    const payloadFull = (await verifyPromise(
        refreshToken,
        jwt_refresh_secret,
        {},
    )) as any;
    const { iat, exp, ...payload } = payloadFull;

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
        (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn']) ||
        '15m';

    // Issue a new access token. Adjust payload fields and sign options as needed.
    const accessToken = await signPromise(
        { ...payload, type: 'access' },
        jwt_access_secret,
        { expiresIn: jwt_access_expires_in },
    );

    return res.json({ accessToken });
};

export default refreshRoute;
