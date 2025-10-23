enum InstrumentType {
    STOCK = 'stock',
    BOND = 'bond',
    ETF = 'etf',
    MUTUAL_FUND = 'mutual_fund',
}

export const InstrumentTypeArray = Object.values(InstrumentType);

export default InstrumentType;