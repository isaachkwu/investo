import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import { AppError } from '#utils/AppError.js';

const meRoute: RequestHandler = async (req, res) => {
    const user = await db
        .selectFrom('appUser')
        .selectAll()
        .where('userId', '=', req.user!.userId)
        .executeTakeFirst();
    if (!user) {
        throw new AppError(404, 'User not found', 'not_found');
    }
    return res.json(user);
};

export default meRoute;
