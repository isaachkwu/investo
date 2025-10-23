# Glossery

- realized gain/loss is the amount of gain/loss that occur by actual selling, interest, maturity, and fees
- unrealized gain/loss is the amount of gain/loss if the instrument holder sell the asset at this moment

# DB schemas

- User
    - userId: UUID
    - bcrypt password hash: varchar
    - email: varchar
    - name: varchar
    - cash deposit: double

    - cash balance: double (memoized: desposited - sum of buy transaction (q*p) + sum of sell transaction (q*p))
    - realized profit/loss (memoized: sum of all success sell transaction ((target price - average buying price) * quantity)) or (sum of investment's realized gain/loss)
    - realized profit/loss rate (memoized: realized profit/loss / (sum of investments' avg buying price * quantity))
    - unrealized profit/loss (sum of (investment current price - investment buying price) * quantity)
    - unrealized profit/loss rate (unrealized profit/loss / cash deposit)

- Instrument
    - instrumentId: UUID
    - fullName: varchar
    - symbol: varchar
    - marketId: foreign key

    - price, price history, performance metrics: either from yahoo finance for made up in db

- (optional) Investment/Assets (composite forign key) (memoized purposes)
    - userId
    - instrumentId

    - quatity (memoized: all user-instruments transactions (buy quantity - sell quantity))
    - average buying price (memoized: sum of (q*p)/sum of q)
    
    - realized gain/loss = sum of sell transactions ((sell price - avg buy price) * quantity)
    - realized gain/loss rate = realized gain/loss / (average buying price * quantity)

    - unrealized gain/loss = (investment current price - investment avg buying price) * quantity
    - unrealized gain/loss rate = (unrealized gain/loss) / (average buying price * quantity) 

- Transaction
    - transactionId: UUID
    - userId: foreign key
    - orderDatetime: datetime
    - successDatetime: datetime
    - instrumentId: foreign key
    - action: buy/sell
    - quatity: double
    - target price: double
    - status: pending/failed/succeed/cancelled

    - average asset buying price: double (only for sell) (memoized: datetime before, all transaction's sum of buy (q*p) / sum of buy (q))
