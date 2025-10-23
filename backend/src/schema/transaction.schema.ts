import { z } from 'zod';
import { paginateSchema } from './paginate.schema.js';

export const TransactionEnumType = z.enum(['buy', 'sell']);

export const transactionIdSchema = z.uuid()

export const listTransactionSchema = z.intersection(
    z.object({
        sortBy: z
            .enum(['instrumentId', 'type', 'date'])
            .optional()
            .transform((val) => {
                switch (val) {
                    case 'instrumentId':
                        return 'instrumentId';
                    case 'type':
                        return 'transactionType';
                    case 'date':
                        return 'transactionDate';
                    default:
                        return undefined;
                }
            }),
        order: z.enum(['asc', 'desc']).optional().default('desc'),
        instrumentId: z.string().optional(),
        type: TransactionEnumType.optional(),
    }),
    paginateSchema,
);

export const createTransactionSchema = z.object({
    type: TransactionEnumType,
    instrumentId: z.uuid(),
    quantity: z
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
    pricePerUnit: z
        .number()
        .min(0)
        .refine(
            (n) => {
                const parts = n.toString().split('.');
                return parts.length <= 1 || parts[1].length <= 8;
            },
            {
                message: 'Max precision is 8 decimal places',
            },
        ),
});

export type ListTransaction = z.infer<typeof listTransactionSchema>;
export type CreateTransaction = z.infer<typeof createTransactionSchema>;
