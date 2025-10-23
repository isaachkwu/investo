import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import YahooFinance from 'yahoo-finance2/src/index.ts';
import { AppError } from '#utils/AppError.js';
import { z } from 'zod';

const instrumentIdSchema = z.string().uuid();

const getInvestmentRoute: RequestHandler = async (req, res) => {
    const userId = req.user!.userId;
    const instrumentId = instrumentIdSchema.parse(req.params.instrumentId);

    const investment = await db
        .selectFrom('investment')
        .innerJoin('instrument', 'investment.instrumentId', 'instrument.instrumentId')
        .select([
            'investment.userId',
            'investment.instrumentId',
            'investment.quantity',
            'investment.averagePrice',
            'instrument.fullName',
            'instrument.symbol',
            'instrument.instrumentType',
            'instrument.textDescription',
        ])
        .where('investment.userId', '=', userId)
        .where('investment.instrumentId', '=', instrumentId)
        .executeTakeFirst();

    if (!investment) {
        throw new AppError(404, 'Investment not found', 'not_found');
    }

    const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
    const quote = await yf.quote(investment.symbol);
    const currentPrice = quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose;

    const marketValue = currentPrice ? currentPrice * investment.quantity : null;
    const costBasis = investment.averagePrice * investment.quantity;
    const unrealizedGainLoss = marketValue ? marketValue - costBasis : null;
    const unrealizedGainLossPercent = unrealizedGainLoss ? (unrealizedGainLoss / costBasis) * 100 : null;

    return res.json({
        instrumentId: investment.instrumentId,
        fullName: investment.fullName,
        symbol: investment.symbol,
        instrumentType: investment.instrumentType,
        description: investment.textDescription,
        quantity: investment.quantity,
        averagePrice: investment.averagePrice,
        currentPrice,
        currency: quote?.currency,
        marketValue,
        costBasis,
        unrealizedGainLoss,
        unrealizedGainLossPercent,
        quote: {
            previousClose: quote?.regularMarketPreviousClose ?? null,
            open: quote?.regularMarketOpen ?? null,
            dayLow: quote?.regularMarketDayLow ?? null,
            dayHigh: quote?.regularMarketDayHigh ?? null,
            change: quote?.regularMarketChange ?? null,
            changePercent: quote?.regularMarketChangePercent ?? null,
            marketCap: quote?.marketCap ?? null,
            volume: quote?.regularMarketVolume ?? null,
            avgVolume3m: quote?.averageDailyVolume3Month ?? null,
            fiftyTwoWeekLow: quote?.fiftyTwoWeekLow ?? null,
            fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh ?? null,
        },
    });
};

export default getInvestmentRoute;
