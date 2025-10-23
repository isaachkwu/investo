# test planning

## Stage 1 (bare minimum):
- React frontend with typescript (tanstack router, query, zustand)
- Node.JS backend with typescript
- PostgreSQL 
- Authentication with stateless JWT 
- Features:
    - Show available instruments (stocks, bonds, mutual funds)
    - Show personal instruments
    - Buy/Sell stock,bonds,mutual funds
    - Show transaction history
    - Dashboard/Summary

## Stage 2 (expected):
- Indexing in DB
- type-safe queries in backend (Kysely)
- Optimizing queries/writes
- SSE instead of client pull 

## Stage 3 (excellent):
- TimescaleDB 
- GraphQL
- Type validation across frontend and backend (tRPC, Zod, Yup)
- Generate OpenAPI schema