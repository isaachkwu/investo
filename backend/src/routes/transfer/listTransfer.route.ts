import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import { paginateRoute } from '#utils/paginateRoute.js';
import { listTransferSchema } from '#schema/transfer.schema.js';

const listTransferRoute: RequestHandler = paginateRoute(async (req, res) => {
    const { sortBy, order, transferType } = listTransferSchema.parse(req.query);
    const transfers = await db
        .selectFrom('transferLog')
        .select([
            'transferId',
            'amount',
            'transferType',
            'transferDate',
            db.fn.countAll().over().as('totalCount'),
        ])
        .$if(!!transferType, qb => qb.where('transferType', '=', transferType!))
        .where('userId', '=', req.user!.userId)
        .orderBy(sortBy ?? 'transferDate', order ?? 'desc')
        .execute();
    const response = transfers.map(({totalCount, ...rest}) => rest)
    res.paginatedData = response;
    res.paginatedTotalCount =
        response.length > 0 ? Number(transfers[0].totalCount) : 0;
    return;
});

export default listTransferRoute;
