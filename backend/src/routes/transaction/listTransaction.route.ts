import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import { paginateRoute } from '#utils/paginateRoute.js';
import { listTransactionSchema } from '#schema/transaction.schema.js';

const listTransactionRoute: RequestHandler = paginateRoute(async (req, res) => {
    const { sortBy, order, instrumentId, type, } = listTransactionSchema.parse(req.query);
    const transactions = await db
        .selectFrom('transaction')
        .innerJoin('instrument', 'transaction.instrumentId', 'instrument.instrumentId')
        .select([
            'transaction.transactionId',
            'transaction.instrumentId',
            'transaction.pricePerUnit',
            'transaction.quantity',
            'transaction.transactionDate',
            'instrument.fullName',
            'instrument.symbol',
            'transaction.transactionType',
            db.fn.countAll().over().as('totalCount'),
        ])
        .$if(!!type, qb => qb.where('transaction.transactionType', '=', type!))
        .$if(!!instrumentId, qb => qb.where('transaction.instrumentId', '=', instrumentId!))
        .where('userId', '=', req.user!.userId)
        .orderBy(sortBy ?? 'transaction.transactionDate', order ?? 'desc')
        .execute();
    const response = transactions.map(({totalCount, ...rest}) => rest)
    res.paginatedData = response;
    res.paginatedTotalCount =
        response.length > 0 ? Number(transactions[0].totalCount) : 0;
});

export default listTransactionRoute;
