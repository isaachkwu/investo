import { createTransactionSchema } from '#schema/transaction.schema.js';
import { sql } from 'kysely';
import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import { AppError } from '#utils/AppError.js';
import { Decimal } from 'decimal.js';
import { Investment } from '#db/types.js';

const createTransactionRoute: RequestHandler = async (req, res, next) => {
    const { type, instrumentId, quantity, pricePerUnit } =
        createTransactionSchema.parse(req.body);
    const totalPrice = quantity * pricePerUnit;
    const delta = type === 'sell' ? totalPrice : -totalPrice;
    const userId = req.user!.userId;
    const updated = await db.transaction().execute(async (trx) => {
        const instrument = await trx
            .selectFrom('instrument')
            .select('instrumentId')
            .where('instrumentId', '=', instrumentId)
            .executeTakeFirst();

        if (!instrument) {
            throw new AppError(
                400,
                'Invalid instrument ID',
                'invalid_instrument_id',
            );
        }
        // 1) Lock the user row to prevent concurrent updates
        const user = await trx
            .selectFrom('appUser')
            .select(['cashBalance'])
            .where('userId', '=', userId)
            .forUpdate()
            .executeTakeFirst();

        const investment = await trx
            .selectFrom('investment')
            .select(['quantity', 'averagePrice', 'realizedPnl'])
            .where('userId', '=', userId)
            .where('instrumentId', '=', instrumentId)
            .forUpdate()
            .executeTakeFirst();

        if (!user)
            throw new AppError(400, 'User does not exist', 'user_not_found');

        // Additional check for sell transactions
        if (
            type == 'sell' &&
            (!investment || new Decimal(investment.quantity).lessThan(quantity))
        )
            throw new AppError(
                400,
                'user do not have sufficient holdings to sell',
                'insufficient_holdings',
            );

        // 2) Business rule: prevent negative balance
        if (type == 'buy') {
            const currentBalance = new Decimal(user.cashBalance ?? 0);
            const newBalance = currentBalance.plus(delta);
            if (newBalance.isNegative())
                throw new AppError(
                    400,
                    'user do not have sufficient funds after the transaction',
                    'insufficient_funds',
                );
        }

        // 3) Insert transaction log (part of same transaction)
        const newTransaction = await trx
            .insertInto('transaction')
            .values({
                userId,
                instrumentId,
                quantity,
                pricePerUnit,
                transactionType: type,
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

        // 5) Update investment holdings
        const currentQuantity = new Decimal(investment?.quantity ?? 0);
        const currentAvgPrice = new Decimal(investment?.averagePrice ?? 0);
        let newQuantity: Decimal;
        let newAvgPrice: Decimal;
        let newInvestment: Investment | undefined;
        const currentRealizedPnl: Decimal = new Decimal(investment?.realizedPnl ?? 0);
        let newRealizedPnl: Decimal = currentRealizedPnl;
        if (type === 'buy') {
            newQuantity = currentQuantity.plus(quantity);
            newAvgPrice = currentAvgPrice
                .times(currentQuantity)
                .plus(new Decimal(pricePerUnit).times(quantity))
                .dividedBy(newQuantity);
        } else {
            newQuantity = currentQuantity.minus(quantity);
            newAvgPrice = currentAvgPrice; // average price remains the same on sell
            const pnlPerUnit = new Decimal(pricePerUnit).minus(currentAvgPrice);
            const realizedPnlFromThisSale = pnlPerUnit.times(quantity);
            newRealizedPnl = currentRealizedPnl.plus(realizedPnlFromThisSale);
        }

        if (investment) {
            newInvestment = await trx
                .updateTable('investment')
                .set({
                    quantity: newQuantity.toNumber(),
                    averagePrice: newAvgPrice.toNumber(),
                    realizedPnl: newRealizedPnl.toNumber(),
                })
                .where('userId', '=', userId)
                .where('instrumentId', '=', instrumentId)
                .returningAll()
                .executeTakeFirstOrThrow();
        } else {
            // Insert new investment record
            newInvestment = await trx
                .insertInto('investment')
                .values({
                    userId,
                    instrumentId,
                    quantity: newQuantity.toNumber(),
                    averagePrice: newAvgPrice.toNumber(),
                    realizedPnl: newRealizedPnl.toNumber()
                })
                .returningAll()
                .executeTakeFirstOrThrow();
        }
        return {
            cashBalance: result?.cashBalance,
            newTransaction,
            newInvestment,
        };
    });
    return res.status(201).json(updated);
};

export default createTransactionRoute;
