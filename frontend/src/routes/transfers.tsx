import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Filter, AlertCircle, RefreshCcw } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '../utils/errorHandling'

interface Transfer {
  transferId: number
  amount: string
  transferType: 'deposit' | 'withdraw'
  transferDate: string
}

interface TransferListResponse {
  data: Transfer[]
  totalCount: number
}

export default function TransfersPage() {
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdraw'>('all')
  const [sortBy, setSortBy] = useState<'transferDate' | 'amount'>('transferDate')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const { data: transfers, isLoading, error } = useQuery({
    queryKey: ['transfers', filterType, sortBy, order],
    queryFn: async (): Promise<Transfer[]> => {
      const params = new URLSearchParams({
        pageSize: '100',
        sortBy,
        order,
      })
      
      if (filterType !== 'all') {
        params.append('transferType', filterType)
      }

      const response = await api.get(`/transfer?${params.toString()}`)
      return response.data
    }
  })

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount))
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

  const getTransferIcon = (type: 'deposit' | 'withdraw') => {
    return type === 'deposit' 
      ? <TrendingUp className="w-5 h-5 text-green-600" />
      : <TrendingDown className="w-5 h-5 text-red-600" />
  }

  const getTransferColor = (type: 'deposit' | 'withdraw') => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Transfers</h2>
          <p className="text-slate-600 mb-4">{getErrorMessage(error, 'Unable to load transfer history')}</p>
          <div className="flex gap-3 justify-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transfer History</h1>
              <p className="text-gray-600 mt-2">
                {transfers?.length || 0} transfers found
              </p>
            </div>
            <Link to="/transfer" className="block">
              <Button>
                <TrendingUp className="w-4 h-4 mr-2" />
                New Transfer
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="deposit">Deposits Only</option>
                <option value="withdraw">withdraws Only</option>
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
                <option value="transferDate">Date</option>
                <option value="amount">Amount</option>
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

        {/* Transfers List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {!transfers || transfers.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transfers found</h3>
              <p className="text-gray-600 mb-4">
                {filterType === 'all' 
                  ? "You haven't made any transfers yet."
                  : `No ${filterType}s found with current filters.`
                }
              </p>
              <Link to="/transfer">
                <Button>Make Your First Transfer</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                  {transfers.map((transfer) => (
                    <tr key={transfer.transferId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransferIcon(transfer.transferType)}
                          <span className={`ml-2 font-medium capitalize ${getTransferColor(transfer.transferType)}`}>
                            {transfer.transferType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${getTransferColor(transfer.transferType)}`}>
                          {transfer.transferType === 'deposit' ? '+' : '-'}
                          {formatCurrency(transfer.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {formatDate(transfer.transferDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                        #{transfer.transferId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}