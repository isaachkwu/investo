import { Database } from './types.js'
import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely'
import { Pool, types } from 'pg'

types.setTypeParser(types.builtins.NUMERIC, (value) => {
  return parseFloat(value);
});

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool,
    }),
    plugins: [
        new CamelCasePlugin()
    ]
})