import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import { investmentQuerySchema } from '#schema/investment.schema.js';
import { paginateRoute } from '#utils/paginateRoute.js';
import YahooFinance from 'yahoo-finance2/src/index.ts';

const listInvestmentRoute: RequestHandler = paginateRoute(
    async (req, res, _) => {
        const userId = req.user!.userId;
        const {
            instrumentId,
            sortBy,
            isOpen
        } = investmentQuerySchema.parse(req.query);
        const { page, pageSize, order } = req;

        const result = await db
            .selectFrom('investment')
            .innerJoin('instrument', 'investment.instrumentId', 'instrument.instrumentId')
            .select([
                db.fn.countAll().over().as('totalCount'),
                'investment.userId',
                'investment.instrumentId',
                'investment.quantity',
                'investment.averagePrice',
                'investment.realizedPnl',
                'instrument.fullName',
                'instrument.symbol',
                'instrument.instrumentType'
            ])
            .where('investment.userId', '=', userId)
            .$if(!!instrumentId, (qb) =>
                qb.where('investment.instrumentId', '=', instrumentId!),
            )
            .$if(isOpen === true, (qb) =>
                qb.where('investment.quantity', '>', 0),
            )
            .$if(!!sortBy, (qb) => qb.orderBy(`investment.${sortBy!}`, order ?? 'asc'))
            .offset(((page ?? 1) - 1) * (pageSize ?? 10))
            .limit(pageSize ?? 10)
            .execute();

        const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

        const investments = await Promise.all(
            result.map(async ({ totalCount, ...rest }) => {
                const quote = await yf.quote(rest.symbol);
                const currentPrice = quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose;
                
                if (currentPrice === undefined) {
                    console.log(`Price not found for symbol: ${rest.symbol}`);
                }

                const marketValue = currentPrice ? currentPrice * rest.quantity : null;
                const costBasis = rest.averagePrice * rest.quantity;
                const unrealizedGainLoss = marketValue ? marketValue - costBasis : null;
                const unrealizedGainLossPercent = unrealizedGainLoss ? (unrealizedGainLoss / costBasis) * 100 : null;

                return {
                    ...rest,
                    currentPrice,
                    currency: quote?.currency,
                    marketValue,
                    costBasis,
                    unrealizedGainLoss,
                    unrealizedGainLossPercent,
                };
            }),
        );

        res.paginatedData = investments;
        res.paginatedTotalCount = Number(result[0]?.totalCount) ?? 0;
        return;
    },
);

export default listInvestmentRoute;
