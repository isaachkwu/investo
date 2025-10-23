import { createTransferSchema } from '#schema/transfer.schema.js';
import { sql } from 'kysely';
import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import { AppError } from '#utils/AppError.js';
import { Decimal } from 'decimal.js'

const createTransferRoute: RequestHandler = async (req, res, next) => {
    const { amount, transferType } = createTransferSchema.parse(req.body);
    const delta = transferType === 'deposit' ? amount : -amount;
    const userId = req.user!.userId;
    const updated = await db.transaction().execute(async (trx) => {
        // 1) Lock the user row to prevent concurrent updates
        const user = await trx
            .selectFrom('appUser')
            .select(['cashBalance'])
            .where('userId', '=', userId)
            .forUpdate()
            .executeTakeFirst();

        if (!user)
            throw new AppError(400, 'User does not exist', 'user_not_found');

        // 2) Business rule: prevent negative balance
        const currentBalance = new Decimal(user.cashBalance ?? 0);
        const newBalance = currentBalance.plus(delta);

        if (newBalance.isNegative())
            throw new AppError(
                400,
                'user do not have sufficient funds after the withdraw',
                'insufficient_funds',
            );

        // 3) Insert transfer log (part of same transaction)
        const newTransfer = await trx
            .insertInto('transferLog')
            .values({
                userId,
                amount,
                transferType,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        // 4) Update balance atomically and return new balance
        const result = await trx
            .updateTable('appUser')
            .set({ cashBalance: sql`cash_balance + ${delta}` })
            .where('userId', '=', userId)
            .returning('cashBalance')
            .executeTakeFirstOrThrow();

        return { cashBalance: result?.cashBalance, newTransfer };
    });
    return res.status(201).json(updated);
};

export default createTransferRoute;
