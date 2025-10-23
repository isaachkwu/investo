import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { PieChart, ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus, AlertCircle, RefreshCcw } from 'lucide-react'
import api from '../lib/api'
import { getErrorMessage } from '../utils/errorHandling'

type Investment = {
  instrumentId: string
  fullName: string
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  costBasis: number
  unrealizedGainLoss: number
  unrealizedGainLossPercent: number
  realizedPnl: number
}

export default function InvestmentsPage() {
  const { data: investments, isLoading, error } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const res = await api.get('/investment?pageSize=100')
      return res.data as Investment[]
    },
  })

  // Handle errors
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Investments</h2>
          <p className="text-slate-600 mb-4">{getErrorMessage(error, 'Unable to load investment portfolio')}</p>
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your investments...</p>
        </div>
      </div>
    )
  }

  const totalMarketValue = investments?.reduce((sum, inv) => sum + (inv.marketValue || 0), 0) || 0
  const totalCostBasis = investments?.reduce((sum, inv) => sum + (inv.costBasis || 0), 0) || 0
  const totalUnrealized = investments?.reduce((sum, inv) => sum + (inv.unrealizedGainLoss || 0), 0) || 0
  const totalRealized = investments?.reduce((sum, inv) => sum + (inv.realizedPnl || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div className="mb-6 lg:mb-0">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl">
                <PieChart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
                <p className="text-gray-600">Complete overview of your holdings</p>
              </div>
            </div>
          </div>
          <Link to="/trade" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5 mr-2" />
            Add Investment
          </Link>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${totalMarketValue.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Cost Basis</p>
              <PieChart className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${totalCostBasis.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Unrealized P&L</p>
              {totalUnrealized >= 0 ? 
                <ArrowUpRight className="w-4 h-4 text-green-600" /> : 
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              }
            </div>
            <div className={`text-2xl font-bold ${totalUnrealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalUnrealized >= 0 ? '+' : ''}${totalUnrealized.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Realized P&L</p>
              {totalRealized >= 0 ? 
                <TrendingUp className="w-4 h-4 text-green-600" /> : 
                <TrendingDown className="w-4 h-4 text-red-600" />
              }
            </div>
            <div className={`text-2xl font-bold ${totalRealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalRealized >= 0 ? '+' : ''}${totalRealized.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </div>
          </div>
        </div>

        {/* Investments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {investments && investments.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Basis</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Unrealized P&L</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Return %</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Realized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {investments.map((inv) => (
                      <tr key={inv.instrumentId} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{inv.symbol.substring(0, 2)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{inv.symbol}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{inv.fullName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-sm font-medium text-gray-900">
                          {inv.quantity.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right text-sm text-gray-600">
                          ${inv.averagePrice.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right text-sm font-medium text-gray-900">
                          ${inv.currentPrice?.toFixed(2) || '-'}
                        </td>
                        <td className="py-4 px-6 text-right text-sm font-medium text-gray-900">
                          ${inv.marketValue?.toLocaleString('en-US', {minimumFractionDigits: 2}) || '-'}
                        </td>
                        <td className="py-4 px-6 text-right text-sm text-gray-600">
                          ${inv.costBasis.toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </td>
                        <td className="py-4 px-6 text-right text-sm font-medium">
                          <div className={`inline-flex items-center ${(inv.unrealizedGainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(inv.unrealizedGainLoss || 0) >= 0 ? 
                              <ArrowUpRight className="w-3 h-3 mr-1" /> : 
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                            }
                            ${Math.abs(inv.unrealizedGainLoss || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-sm font-medium">
                          <span className={`${(inv.unrealizedGainLossPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(inv.unrealizedGainLossPercent || 0) >= 0 ? '+' : ''}{(inv.unrealizedGainLossPercent || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-sm font-medium">
                          <span className={`${(inv.realizedPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(inv.realizedPnl || 0) >= 0 ? '+' : ''}${(inv.realizedPnl || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card Layout */}
              <div className="xl:hidden">
                {investments.map((inv) => (
                  <div key={inv.instrumentId} className="border-b border-gray-200 p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{inv.symbol.substring(0, 2)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-medium text-gray-900">{inv.symbol}</div>
                          <div className="text-sm text-gray-500">{inv.fullName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-gray-900">
                          ${inv.marketValue?.toLocaleString('en-US', {minimumFractionDigits: 2}) || '-'}
                        </div>
                        <div className={`text-sm font-medium ${(inv.unrealizedGainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(inv.unrealizedGainLoss || 0) >= 0 ? '+' : ''}${(inv.unrealizedGainLoss || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                          <span className="ml-1">
                            ({(inv.unrealizedGainLossPercent || 0) >= 0 ? '+' : ''}{(inv.unrealizedGainLossPercent || 0).toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <div className="font-medium text-gray-900">{inv.quantity.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Price:</span>
                        <div className="font-medium text-gray-900">${inv.averagePrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Current Price:</span>
                        <div className="font-medium text-gray-900">${inv.currentPrice?.toFixed(2) || '-'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost Basis:</span>
                        <div className="font-medium text-gray-900">${inv.costBasis.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Realized P&L:</span>
                        <div className={`font-medium ${(inv.realizedPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(inv.realizedPnl || 0) >= 0 ? '+' : ''}${(inv.realizedPnl || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No investments found</h3>
              <p className="text-gray-500 mb-6">Start building your portfolio by making your first investment</p>
              <Link to="/trade" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Make First Investment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
