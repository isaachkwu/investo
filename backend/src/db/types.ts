import InstrumentType from '#types/domain/instrumentType.js'
import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely'

export interface Database {
  appUser: AppUserTable
  transferLog: TransferLogTable
  instrument: InstrumentTable
  transaction: TransactionTable
  investment: InvestmentTable
}

export interface AppUserTable {
  userId: Generated<string>
  name: string
  email: string
  passwordHash: string
  cashBalance: ColumnType<number, never, number> // denormalized balance
}

export interface TransferLogTable {
  transferId: Generated<string>
  userId: string
  amount: number
  transferType: 'deposit' | 'withdraw'
  transferDate: ColumnType<Date, Date | undefined, never>
}

export interface InstrumentTable {
  instrumentId: Generated<string>
  fullName: string
  symbol: string
  instrumentType: InstrumentType
  textDescription: string | null
  metadata: JSONColumnType<object, object | null, never>
}

export interface TransactionTable {
  transactionId: Generated<string>
  userId: string
  instrumentId: string
  transactionType: 'buy' | 'sell'
  quantity: number
  pricePerUnit: number

  transactionDate: ColumnType<Date, Date | undefined, never>
}

export interface InvestmentTable { // denormalized holdings
  userId: string
  instrumentId: string
  quantity: number
  averagePrice: number
  realizedPnl: number // denormalized, updated on sells
}

export type AppUser = Selectable<Database['appUser']>
export type NewAppUser = Insertable<Database['appUser']>
export type UpdateAppUser = Updateable<Database['appUser']>

export type Instrument = Selectable<Database['instrument']>
export type NewInstrument = Insertable<Database['instrument']>
export type UpdateInstrument = Updateable<Database['instrument']>

export type Transaction = Selectable<Database['transaction']>
export type NewTransaction = Insertable<Database['transaction']>
export type UpdateTransaction = Updateable<Database['transaction']>

export type TransferLog = Selectable<Database['transferLog']>
export type NewTransferLog = Insertable<Database['transferLog']>
export type UpdateTransferLog = Updateable<Database['transferLog']>

export type Investment = Selectable<Database['investment']>
export type NewInvestment = Insertable<Database['investment']>
export type UpdateInvestment = Updateable<Database['investment']>
