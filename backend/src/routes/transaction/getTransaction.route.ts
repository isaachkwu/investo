import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import { AppError } from '#utils/AppError.js';
import { transactionIdSchema } from '#schema/transaction.schema.js';

const getTransactionRoute: RequestHandler = async (req, res, next) => {
    const transactionId = transactionIdSchema.parse(req.params.id);

    const transaction = await db
        .selectFrom('transaction')
        .selectAll()
        .where('transactionId', '=', transactionId)
        .where('userId', '=', req.user!.userId)
        .executeTakeFirst();

    if (!transaction) {
        throw new AppError(400, 'Transaction not found', 'not_found');
    }

    return res.json(transaction);
};

export default getTransactionRoute;
