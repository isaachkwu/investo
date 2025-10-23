import UserJwtPayload from '#types/auth/UserJwtPayload.d.ts';

declare global {
    namespace Express {
        export interface Request {
            user?: UserJwtPayload;

            // Pagination properties
            page?: number;
            pageSize?: number;
            order?: 'asc' | 'desc';
        }
        export interface Response {
            // Pagination properties
            paginatedData?: any[];
            paginatedTotalCount?: number;
        }
    }
}
