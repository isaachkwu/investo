import { RequestHandler } from 'express';
import { db } from '#db/database.js';
import YahooFinance from 'yahoo-finance2/src/index.ts';
import { AppError } from '#utils/AppError.js';
import { instrumentIdSchema } from '#schema/instrument.schema.js'

const getInstrumentRoute: RequestHandler = async (req, res) => {
    const instrumentId = instrumentIdSchema.parse(req.params.id)
    const instrument = await db
        .selectFrom('instrument')
        .selectAll()
        .where('instrumentId', '=', instrumentId)
        .executeTakeFirst();

    if (!instrument) {
        throw new AppError(404, 'Instrument not found', 'not_found');
    }
    const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
    const quote = await yf.quote(instrument.symbol);
    const price =
        quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose;

    return res.json({
        ...instrument,
        price,
        currency: quote?.currency,
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
        },
    });
};

export default getInstrumentRoute;
