import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Filter, TrendingUp, TrendingDown, Search } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'

interface Transaction {
  transactionId: string
  instrumentId: string
  pricePerUnit: number
  quantity: number
  transactionDate: string
  transactionType: 'buy' | 'sell',
  symbol: string
  fullName: string
}

interface Instrument {
  instrumentId: string
  fullName: string
  symbol: string
}

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'instrumentId'>('date')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedInstrument, setSelectedInstrument] = useState<string>('')

  // Fetch transactions with filters
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['transactions', filterType, sortBy, order, selectedInstrument],
    queryFn: async (): Promise<Transaction[]> => {
      const params = new URLSearchParams({
        pageSize: '100',
        sortBy,
        order,
      })
      
      if (filterType !== 'all') {
        params.append('type', filterType)
      }

      if (selectedInstrument) {
        params.append('instrumentId', selectedInstrument)
      }

      const response = await api.get(`/transaction?${params.toString()}`)
      return response.data
    }
  })

  // Fetch instruments for filter dropdown
  const { data: instruments } = useQuery({
    queryKey: ['instruments'],
    queryFn: async (): Promise<Instrument[]> => {
      const response = await api.get('/instrument?pageSize=100')
      return response.data
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: 'buy' | 'sell') => {
    return type === 'buy' 
      ? <TrendingUp className="w-5 h-5 text-green-600" />
      : <TrendingDown className="w-5 h-5 text-red-600" />
  }

  const getTransactionColor = (type: 'buy' | 'sell') => {
    return type === 'buy' ? 'text-green-600' : 'text-red-600'
  }

  const getInstrumentInfo = (instrumentId: string) => {
    const instrument = instruments?.find(i => i.instrumentId === instrumentId)
    return instrument ? `${instrument.symbol} - ${instrument.fullName}` : instrumentId
  }

  const calculateTotal = (price: number, quantity: number) => {
    return price * quantity
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold">Error loading transactions</h2>
            <p className="text-red-600 mt-2">Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
              <p className="text-gray-600 mt-2">
                {transactions?.length || 0} transactions found
              </p>
            </div>
            <Link to="/trade" className="block">
              <Button>
                <TrendingUp className="w-4 h-4 mr-2" />
                New Trade
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Sort
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="buy">Buy Only</option>
                <option value="sell">Sell Only</option>
              </select>
            </div>

            {/* Instrument Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instrument
              </label>
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Instruments</option>
                {instruments?.map((instrument) => (
                  <option key={instrument.instrumentId} value={instrument.instrumentId}>
                    {instrument.symbol} - {instrument.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="type">Type</option>
                <option value="instrumentId">Instrument</option>
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {!transactions || transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600 mb-4">
                {filterType === 'all' && !selectedInstrument
                  ? "You haven't made any transactions yet."
                  : "No transactions found with current filters."
                }
              </p>
              <Link to="/trade">
                <Button>Make Your First Trade</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instrument Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instrument Symbol
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price Per Unit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.transactionId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.transactionType)}
                          <span className={`ml-2 font-medium capitalize ${getTransactionColor(transaction.transactionType)}`}>
                            {transaction.transactionType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getInstrumentInfo(transaction.fullName)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getInstrumentInfo(transaction.symbol)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {transaction.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(transaction.pricePerUnit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(calculateTotal(transaction.pricePerUnit, transaction.quantity))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{transaction.transactionId.slice(0, 8)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Section */}
        {transactions && transactions.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Total Purchases</div>
                <div className="text-xl font-bold text-green-700">
                  {formatCurrency(
                    transactions
                      .filter(t => t.transactionType === 'buy')
                      .reduce((sum, t) => sum + calculateTotal(t.pricePerUnit, t.quantity), 0)
                  )}
                </div>
                <div className="text-sm text-green-600">
                  {transactions.filter(t => t.transactionType === 'buy').length} transactions
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 mb-1">Total Sales</div>
                <div className="text-xl font-bold text-red-700">
                  {formatCurrency(
                    transactions
                      .filter(t => t.transactionType === 'sell')
                      .reduce((sum, t) => sum + calculateTotal(t.pricePerUnit, t.quantity), 0)
                  )}
                </div>
                <div className="text-sm text-red-600">
                  {transactions.filter(t => t.transactionType === 'sell').length} transactions
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">Net Trading Activity</div>
                <div className="text-xl font-bold text-blue-700">
                  {formatCurrency(
                    transactions
                      .filter(t => t.transactionType === 'sell')
                      .reduce((sum, t) => sum + calculateTotal(t.pricePerUnit, t.quantity), 0) -
                    transactions
                      .filter(t => t.transactionType === 'buy')
                      .reduce((sum, t) => sum + calculateTotal(t.pricePerUnit, t.quantity), 0)
                  )}
                </div>
                <div className="text-sm text-blue-600">
                  {transactions.length} total transactions
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}