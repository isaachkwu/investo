import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import { transferIdSchema } from '#schema/transfer.schema.js';
import { AppError } from '#utils/AppError.js';

const getTransferRoute: RequestHandler = async (req, res) => {
    const transferId = transferIdSchema.parse(req.params.id);

    const transfer = await db
        .selectFrom('transferLog')
        .select([
            'transferId',
            'amount',
            'transferType',
            'transferDate',
            'userId',
        ])
        .where('transferId', '=', transferId)
        .where('userId', '=', req.user!.userId)
        .executeTakeFirst();

    if (!transfer) {
        throw new AppError(404, 'Transfer not found', 'not_found');
    }

    res.json(transfer);
};

export default getTransferRoute;
