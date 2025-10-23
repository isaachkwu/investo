CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS app_user (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cash_balance numeric(20,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transfer_log (
    transfer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_user(user_id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    transfer_type VARCHAR(10) CHECK (transfer_type IN ('deposit', 'withdraw')) NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for filtering transfers by user
CREATE INDEX IF NOT EXISTS idx_transfer_user_id 
    ON transfer_log(user_id);

-- Index for filtering by transfer type (listTransfer.route.ts)
CREATE INDEX IF NOT EXISTS idx_transfer_user_type 
    ON transfer_log(user_id, transfer_type);

-- Index for sorting by transfer_date (listTransfer.route.ts sortBy: 'transferDate')
CREATE INDEX IF NOT EXISTS idx_transfer_user_date 
    ON transfer_log(user_id, transfer_date DESC);

-- Index for sorting by amount (listTransfer.route.ts sortBy: 'amount')
CREATE INDEX IF NOT EXISTS idx_transfer_user_amount 
    ON transfer_log(user_id, amount DESC);

CREATE TABLE IF NOT EXISTS instrument (
    instrument_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    instrument_type VARCHAR(20) CHECK (instrument_type IN ('stock', 'bond', 'etf', 'mutual_fund')) NOT NULL,
    text_description TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_instrument_full_name_trgm
    ON instrument USING gin (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_instrument_symbol_trgm
    ON instrument USING gin (symbol gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_instrument_instrument_type
    ON instrument (instrument_type);

-- Additional index for sorting by name (listInstrument.route.ts sortBy: 'name')
CREATE INDEX IF NOT EXISTS idx_instrument_name_sorted 
    ON instrument(full_name);

-- Additional index for sorting by symbol (listInstrument.route.ts sortBy: 'symbol')
CREATE INDEX IF NOT EXISTS idx_instrument_symbol_sorted 
    ON instrument(symbol);

-- Composite index for filtering by type and sorting by name
CREATE INDEX IF NOT EXISTS idx_instrument_type_name 
    ON instrument(instrument_type, full_name);

CREATE TABLE IF NOT EXISTS investment (
    user_id UUID NOT NULL,
    instrument_id UUID NOT NULL,
    quantity NUMERIC(20, 2) NOT NULL DEFAULT 0,
    average_price NUMERIC(22, 8) NOT NULL DEFAULT 0,
    realized_pnl DOUBLE PRECISION NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, instrument_id),
    FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (instrument_id) REFERENCES instrument(instrument_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_investment_user_quantity 
    ON investment(user_id, quantity DESC);

-- Index for sorting by average_price (listInvestment.route.ts sortBy: 'averagePrice')
CREATE INDEX IF NOT EXISTS idx_investment_user_avgprice 
    ON investment(user_id, average_price DESC);

-- Index for sorting by instrumentId (listInvestment.route.ts sortBy: 'instrumentId')
-- Already covered by PRIMARY KEY (user_id, instrument_id)

-- Index for filtering by instrumentId with user_id
CREATE INDEX IF NOT EXISTS idx_investment_user_instrument 
    ON investment(user_id, instrument_id);

-- Index for open positions query (quantity > 0)
CREATE INDEX IF NOT EXISTS idx_investment_open_positions 
    ON investment(user_id, quantity) 
    WHERE quantity > 0;

CREATE TABLE IF NOT EXISTS transaction (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_user(user_id) ON DELETE CASCADE,
    instrument_id UUID REFERENCES instrument(instrument_id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) CHECK (transaction_type IN ('buy', 'sell')) NOT NULL,
    quantity NUMERIC(20, 2) NOT NULL,
    price_per_unit NUMERIC(22, 8) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for filtering transactions by user
CREATE INDEX IF NOT EXISTS idx_transaction_user_id 
    ON transaction(user_id);

-- Index for filtering by user and instrument (listTransaction.route.ts)
CREATE INDEX IF NOT EXISTS idx_transaction_user_instrument 
    ON transaction(user_id, instrument_id);

-- Index for filtering by transaction type
CREATE INDEX IF NOT EXISTS idx_transaction_user_type 
    ON transaction(user_id, transaction_type);

-- Index for sorting by transaction_date (listTransaction.route.ts sortBy: 'transactionDate')
CREATE INDEX IF NOT EXISTS idx_transaction_user_date 
    ON transaction(user_id, transaction_date DESC);

-- Index for sorting by quantity (listTransaction.route.ts sortBy: 'quantity')
CREATE INDEX IF NOT EXISTS idx_transaction_user_quantity 
    ON transaction(user_id, quantity DESC);

-- Index for sorting by price_per_unit (listTransaction.route.ts sortBy: 'pricePerUnit')
CREATE INDEX IF NOT EXISTS idx_transaction_user_price 
    ON transaction(user_id, price_per_unit DESC);

-- Composite index for common query pattern: user + instrument + date order
CREATE INDEX IF NOT EXISTS idx_transaction_user_instrument_date 
    ON transaction(user_id, instrument_id, transaction_date DESC);

-- Insert 100 sample instruments (25 stocks, 25 bonds, 25 etfs, 25 mutual_funds)
INSERT INTO instrument (full_name, symbol, instrument_type, text_description, metadata) VALUES
('BlueWave Energy', 'BWEN', 'stock', 'Integrated energy company with renewables assets.', '{"sector":"energy","risk":"medium"}'::jsonb),
('Frontier Logistics', 'FRLG', 'stock', 'Logistics and freight services with global reach.', '{"sector":"transportation","risk":"medium"}'::jsonb),
('Ionix Materials', 'IONX', 'stock', 'Materials science company for industrial applications.', '{"sector":"materials","risk":"medium"}'::jsonb),
('Apple Inc.', 'AAPL', 'stock', 'Designs, manufactures, and markets consumer electronics, software, and services.', '{"sector":"technology","risk":"medium","exchange":"NASDAQ","market_cap":"large"}'::jsonb),
('Microsoft Corporation', 'MSFT', 'stock', 'Develops, licenses, and supports software, services, devices, and solutions.', '{"sector":"technology","risk":"medium","exchange":"NASDAQ","market_cap":"large"}'::jsonb),
('Amazon.com, Inc.', 'AMZN', 'stock', 'Operates e-commerce platforms, cloud computing services, and digital streaming.', '{"sector":"consumer_discretionary","risk":"medium","exchange":"NASDAQ","market_cap":"large"}'::jsonb),
('Alphabet Inc.', 'GOOGL', 'stock', 'Holding company for Google, specializing in internet-related services and products.', '{"sector":"communication_services","risk":"medium","exchange":"NASDAQ","market_cap":"large"}'::jsonb),
('Meta Platforms, Inc.', 'META', 'stock', 'Operates social media platforms and invests in augmented and virtual reality.', '{"sector":"communication_services","risk":"high","exchange":"NASDAQ","market_cap":"large"}'::jsonb),
('Netflix, Inc.', 'NFLX', 'stock', 'Provides subscription streaming entertainment services worldwide.', '{"sector":"communication_services","risk":"medium","exchange":"NASDAQ","market_cap":"large"}'::jsonb),
('Tesla, Inc.', 'TSLA', 'stock', 'Designs, manufactures, and sells electric vehicles and energy products.', '{"sector":"consumer_discretionary","risk":"high","exchange":"NASDAQ","market_cap":"large"}'::jsonb),
('NVIDIA Corporation', 'NVDA', 'stock', 'Designs graphics processing units (GPUs) and AI computing technologies.', '{"sector":"technology","risk":"high","exchange":"NASDAQ","market_cap":"large"}'::jsonb),
('JPMorgan Chase & Co.', 'JPM', 'stock', 'Provides financial services including commercial banking, investment banking, and asset management.', '{"sector":"financials","risk":"medium","exchange":"NYSE","market_cap":"large"}'::jsonb),
('Visa Inc.', 'V', 'stock', 'Operates electronic payments network worldwide and offers related services.', '{"sector":"financials","risk":"medium","exchange":"NYSE","market_cap":"large"}'::jsonb),

('Green Bond 2033', 'GBND', 'bond', 'Green-labelled bond funding renewable projects.', '{"maturity":"2033-12-01","issuer":"corporate","yield":"2.6%"}'::jsonb),
('iShares 20+ Year Treasury Bond ETF', 'TLT', 'bond', 'ETF providing exposure to long-term U.S. Treasury bonds.', '{"provider":"iShares","duration":"long","asset":"treasury"}'::jsonb),
('iShares 7-10 Year Treasury Bond ETF', 'IEF', 'bond', 'ETF tracking intermediate-term U.S. Treasury bonds.', '{"provider":"iShares","duration":"intermediate","asset":"treasury"}'::jsonb),
('iShares 3-7 Year Treasury Bond ETF', 'IEI', 'bond', 'ETF offering exposure to short-to-intermediate U.S. Treasury bonds.', '{"provider":"iShares","duration":"short-intermediate","asset":"treasury"}'::jsonb),
('SPDR Bloomberg 1-3 Month T-Bill ETF', 'BIL', 'bond', 'ETF investing in short-term U.S. Treasury bills.', '{"provider":"SPDR","duration":"ultra-short","asset":"treasury"}'::jsonb),
('iShares iBoxx $ Investment Grade Corporate Bond ETF', 'LQD', 'bond', 'ETF focused on investment-grade corporate bonds.', '{"provider":"iShares","asset":"corporate","risk":"investment-grade"}'::jsonb),
('iShares iBoxx $ High Yield Corporate Bond ETF', 'HYG', 'bond', 'ETF providing exposure to high-yield corporate bonds.', '{"provider":"iShares","asset":"corporate","risk":"high-yield"}'::jsonb),
('iShares TIPS Bond ETF', 'TIP', 'bond', 'ETF providing inflation-protected U.S. Treasury exposure (TIPS).', '{"provider":"iShares","asset":"TIPS","inflation_protected":true}'::jsonb),
('Vanguard Short-Term Bond ETF', 'BSV', 'bond', 'ETF offering exposure to short-term investment-grade U.S. bonds.', '{"provider":"Vanguard","duration":"short","asset":"bond"}'::jsonb),
('Vanguard Short-Term Treasury ETF', 'VGSH', 'bond', 'ETF that targets short-term U.S. Treasury bonds.', '{"provider":"Vanguard","duration":"short","asset":"treasury"}'::jsonb),
('Vanguard Long-Term Bond ETF', 'BLV', 'bond', 'ETF investing in long-term investment-grade bonds.', '{"provider":"Vanguard","duration":"long","asset":"bond"}'::jsonb),

('Vanguard S&P 500 ETF', 'VOO', 'etf', 'ETF tracking the S&P 500 index.', '{"provider":"Vanguard","follow":"S&P500"}'::jsonb),
('iShares Core MSCI EAFE ETF', 'IEFA', 'etf', 'ETF providing exposure to developed markets outside US/Canada.', '{"provider":"iShares","region":"EAFE"}'::jsonb),
('SPDR Gold Shares', 'GLD', 'etf', 'ETF backed by physical gold holdings.', '{"provider":"SPDR","asset":"gold"}'::jsonb),
('Vanguard Total Bond Market ETF', 'BND', 'etf', 'Broad exposure to US investment-grade bonds.', '{"provider":"Vanguard","asset":"bonds"}'::jsonb),
('Invesco QQQ Trust', 'QQQ', 'etf', 'ETF tracking the NASDAQ-100.', '{"provider":"Invesco","follow":"NASDAQ-100"}'::jsonb),
('Schwab U.S. Dividend Equity ETF', 'SCHD', 'etf', 'ETF focusing on high dividend yield U.S. stocks.', '{"provider":"Schwab","strategy":"dividend"}'::jsonb),
('ARK Innovation ETF', 'ARKK', 'etf', 'Actively managed ETF targeting disruptive innovation.', '{"provider":"ARK","strategy":"growth"}'::jsonb),
('iShares Emerging Markets ETF', 'EEM', 'etf', 'ETF giving exposure to emerging markets equities.', '{"provider":"iShares","region":"emerging"}'::jsonb),
('Vanguard Real Estate ETF', 'VNQ', 'etf', 'ETF investing in US real estate investment trusts.', '{"provider":"Vanguard","asset":"realestate"}'::jsonb),
('SPDR Bloomberg Barclays High Yield Bond ETF', 'JNK', 'etf', 'ETF providing exposure to high-yield corporate bonds.', '{"provider":"SPDR","asset":"highyield"}'::jsonb),
('Global Clean Energy ETF', 'ICLN', 'etf', 'ETF focused on clean energy companies.', '{"provider":"iShares","theme":"cleanenergy"}'::jsonb),
('iShares Core U.S. Aggregate Bond ETF', 'AGG', 'etf', 'ETF tracking the US aggregate bond market.', '{"provider":"iShares","asset":"aggregatebond"}'::jsonb),
('Sector Technology ETF', 'XLK', 'etf', 'ETF providing exposure to large technology companies.', '{"provider":"SPDR","sector":"technology"}'::jsonb),
('Small-Cap Value ETF', 'VBR', 'etf', 'ETF focusing on small-cap value stocks.', '{"provider":"Vanguard","style":"value"}'::jsonb),
('Dividend Aristocrats ETF', 'NOBL', 'etf', 'ETF tracking companies with long dividend growth history.', '{"provider":"ProShares","strategy":"dividend"}'::jsonb),
('Commodity Index ETF', 'DBC', 'etf', 'ETF providing diversified commodity exposure.', '{"provider":"Invesco","asset":"commodities"}'::jsonb),
('Global Infrastructure ETF', 'IGF', 'etf', 'ETF investing in global infrastructure companies.', '{"provider":"iShares","theme":"infrastructure"}'::jsonb),
('MSCI World ETF', 'URTH', 'etf', 'ETF tracking the MSCI World index.', '{"provider":"iShares","coverage":"world"}'::jsonb),
('Clean Water ETF', 'PHO', 'etf', 'ETF focused on water industry companies.', '{"provider":"Invesco","theme":"water"}'::jsonb),

('Fidelity Contrafund', 'FCF', 'mutual_fund', 'Actively managed mutual fund with diversified holdings.', '{"manager":"Fidelity","style":"growth"}'::jsonb),
('Neuberger Berman Core', 'NBCR', 'mutual_fund', 'Core equity mutual fund with diversified holdings.', '{"manager":"Neuberger Berman","style":"core"}'::jsonb),
('Vanguard Total Bond Market', 'VBTLX', 'mutual_fund', 'Broad bond mutual fund tracking US investment-grade bonds.', '{"manager":"Vanguard","asset":"bonds"}'::jsonb),
('Vanguard 500 Index Fund Admiral Shares', 'VFIAX', 'mutual_fund', 'Admiral share class of Vanguard S&P 500 index mutual fund.', '{"manager":"Vanguard","style":"index","benchmark":"S&P 500","region":"US"}'::jsonb),
('Vanguard Total Stock Market Index Fund Admiral Shares', 'VTSAX', 'mutual_fund', 'Admiral share class providing broad exposure to the U.S. stock market.', '{"manager":"Vanguard","style":"index","benchmark":"CRSP US Total Market","region":"US"}'::jsonb),
('Fidelity 500 Index Fund', 'FXAIX', 'mutual_fund', 'Fidelity index fund that seeks to track the performance of the S&P 500.', '{"manager":"Fidelity","style":"index","benchmark":"S&P 500","region":"US"}'::jsonb),
('Schwab S&P 500 Index Fund', 'SWPPX', 'mutual_fund', 'Schwab mutual fund tracking the S&P 500 Index with low expense ratio.', '{"manager":"Schwab","style":"index","benchmark":"S&P 500","region":"US"}'::jsonb),
('T. Rowe Price Blue Chip Growth Fund', 'TRBCX', 'mutual_fund', 'Actively managed growth fund investing in large-cap blue-chip companies.', '{"manager":"T. Rowe Price","style":"growth","category":"large-cap","region":"US"}'::jsonb),
('Vanguard Wellington Fund Investor Shares', 'VWELX', 'mutual_fund', 'Balanced mutual fund with allocations to stocks and bonds, value-oriented.', '{"manager":"Vanguard","style":"balanced","allocation":"equity+fixed_income","region":"US"}'::jsonb),
('American Funds Growth Fund of America', 'AGTHX', 'mutual_fund', 'Large-cap growth-focused fund from American Funds, actively managed.', '{"manager":"American Funds","style":"growth","category":"large-cap","region":"US"}'::jsonb),
('Dodge & Cox Stock Fund', 'DODGX', 'mutual_fund', 'Value-oriented, actively managed large-cap US equity fund.', '{"manager":"Dodge & Cox","style":"value","category":"large-cap","region":"US"}'::jsonb),
('PIMCO Total Return Fund', 'PTTRX', 'mutual_fund', 'Broadly diversified fixed income fund managed by PIMCO.', '{"manager":"PIMCO","style":"fixed_income","strategy":"total_return","region":"global"}'::jsonb),
('Vanguard Total International Stock Index Fund Admiral Shares', 'VTIAX', 'mutual_fund', 'Admiral share class offering diversified international equity exposure.', '{"manager":"Vanguard","style":"index","benchmark":"FTSE Global All Cap ex US","region":"international"}'::jsonb);


