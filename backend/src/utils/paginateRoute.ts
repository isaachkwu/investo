import { RequestHandler, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { paginateSchema } from '#schema/paginate.schema.js';

export const paginateRoute = (route: RequestHandler): RequestHandler => {
    return async (req, res, next) => {
        const { page, pageSize } = paginateSchema.parse(req.query);
        req.page = page ?? 1;
        req.pageSize = pageSize ?? 10;
        await route(req, res, next);
        res.paginatedData = res.paginatedData ?? [];
        res.paginatedTotalCount = res.paginatedTotalCount ?? 0;
        const startingIndex = ((req.page ?? 1) - 1) * (req.pageSize ?? 10);
        res.setHeader(
            'Content-Range',
            `instruments ${startingIndex}-${startingIndex + req.pageSize}/${res.paginatedTotalCount}`,
        );
        res.setHeader('X-Total-Count', res.paginatedTotalCount.toString());
        res.setHeader(
            'Access-Control-Expose-Headers',
            'X-Total-Count, Content-Range',
        );
        return res.json(res.paginatedData);
    };
};
