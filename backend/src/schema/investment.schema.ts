import { z } from 'zod';
import { paginateSchema } from '#schema/paginate.schema.js';

const sortableFields = ['instrumentId', 'quantity', 'averagePrice'] as const;

export const investmentQuerySchema = z.intersection(z.object({
    instrumentId: z.uuid().optional(),
    sortBy: z.enum(sortableFields).optional(),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
    isOpen: z.enum(['true', 'false']).optional().transform((val) => val === 'true')
}), paginateSchema);

export type InvestmentQuery = z.infer<typeof investmentQuerySchema>;
