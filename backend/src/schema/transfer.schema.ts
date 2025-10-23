import { z } from 'zod';
import { paginateSchema } from './paginate.schema.js';

export const TransferTypeEnum = z.enum(['deposit', 'withdraw']);

export const transferIdSchema = z.uuid()

export const listTransferSchema = z.intersection(
    z.object({
        sortBy: z
            .enum(['transferDate', 'amount', 'transferType'])
            .optional()
            .transform((val) => {
                switch (val) {
                    case 'transferDate':
                        return 'transferDate';
                    case 'amount':
                        return 'amount';
                    case 'transferType':
                        return 'transferType';
                    default:
                        return undefined;
                }
            }),
        order: z.enum(['asc', 'desc']).optional().default('desc'),
        transferType: TransferTypeEnum.optional()
    }),
    paginateSchema,
);

export const createTransferSchema = z.object({
    amount: z
        .number()
        .min(0)
        .refine(
            (n) => {
                const parts = n.toString().split('.');
                return parts.length <= 1 || parts[1].length <= 2;
            },
            {
                message: 'Max precision is 2 decimal places',
            },
        ),
    transferType: TransferTypeEnum,
});

export type ListTransfer = z.infer<typeof listTransferSchema>;
export type CreateTransfer = z.infer<typeof createTransferSchema>;
