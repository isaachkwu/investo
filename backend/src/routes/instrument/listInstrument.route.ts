import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import { instrumentQuerySchema } from '#schema/instrument.schema.js';
import { paginateRoute } from '#utils/paginateRoute.js';
import YahooFinance from 'yahoo-finance2/src/index.ts';

const listInstrumentRoute: RequestHandler = paginateRoute(
    async (req, res, _) => {
        const {
            nameOrSymbol,
            instrumentType,
            description,
            sortBy,
            order,
            page,
            pageSize,
        } = instrumentQuerySchema.parse(req.query);

        const result = await db
            .selectFrom('instrument')
            .select([
                db.fn.countAll().over().as('totalCount'),
                'fullName',
                'symbol',
                'instrumentType',
                'instrumentId'
            ])
            .$if(!!nameOrSymbol, (qb) =>
                qb.where(eb => eb.or([
                    eb('fullName', 'ilike', `%${nameOrSymbol}%`),
                    eb('symbol', 'ilike', `%${nameOrSymbol}%`)
                ])),
            )
            .$if(!!instrumentType, (qb) =>
                qb.where('instrumentType', '=', instrumentType!),
            )
            .$if(!!description, (qb) =>
                qb.where('textDescription', 'ilike', `%${description}%`),
            )
            .$if(!!sortBy, (qb) => qb.orderBy(sortBy!, order ?? 'asc'))
            .offset(((page ?? 1) - 1) * (pageSize ?? 10))
            .limit(pageSize ?? 10)
            .execute();

        const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

        const instruments = await Promise.all(
            result.map(async ({ totalCount, ...rest }) => {
                const quote = await yf.quote(rest.symbol);
                const price = quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose;
                if (price === undefined) {
                    console.log(`Price not found for symbol: ${rest.symbol}`);
                }
                return {
                    ...rest,
                    price,
                    currency: quote?.currency,
                };
            }),
        );

        res.paginatedData = instruments;
        res.paginatedTotalCount = Number(result[0]?.totalCount) ?? 0;
        return;
    },
);

export default listInstrumentRoute;
