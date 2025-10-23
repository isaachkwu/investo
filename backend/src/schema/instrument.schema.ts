import { z } from 'zod';
import { InstrumentTypeArray } from '#types/domain/instrumentType.js';
import { paginateSchema } from '#schema/paginate.schema.js';

export const InstrumentTypeEnum = z.enum(InstrumentTypeArray);

const sortableFields = ['name', 'symbol', 'instrumentType'] as const;

export const instrumentIdSchema = z.uuid()

export const instrumentQuerySchema = z.intersection(z.object({
    nameOrSymbol: z.string().optional(),
    instrumentType: InstrumentTypeEnum.optional(),
    description: z.string().optional(),
    sortBy: z.enum(sortableFields).optional().transform((val) => {
        switch (val) {
            case 'name':
                return 'fullName';
            case 'symbol':
                return 'symbol';
            case 'instrumentType':
                return 'instrumentType';
            default:
                return undefined;
        }
    }),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
}), paginateSchema)

export type InstrumentQuery = z.infer<typeof instrumentQuerySchema>;