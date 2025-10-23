import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Settings, Plus, Eye, ArrowUpRight, ArrowDownRight, AlertCircle, RefreshCcw } from 'lucide-react'
import api from '../lib/api'
import { getErrorMessage } from '../utils/errorHandling'

type User = {
  userId: string
  name: string
  email: string
  cashBalance: number
}

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

export default function DashboardPage() {
  const { data: user, error: userError, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/user/me')
      return res.data as User
    },
  })

  const { data: investments, error: investmentsError, isLoading: investmentsLoading } = useQuery({
    queryKey: ['investments', { isOpen: true }],
    queryFn: async () => {
      const res = await api.get('/investment?isOpen=true&pageSize=100')
      return res.data as Investment[]
    },
    refetchInterval: 5 * 1000, // Refresh every 5 seconds
  })

  // Fetch all investments (including closed ones) to calculate total realized gains
  const { data: allInvestments, error: allInvestmentsError } = useQuery({
    queryKey: ['investments', { all: true }],
    queryFn: async () => {
      const res = await api.get('/investment?pageSize=100')
      return res.data as Investment[]
    },
  })

  // Handle errors
  if (userError || investmentsError || allInvestmentsError) {
    const errorMessage = getErrorMessage(
      userError || investmentsError || allInvestmentsError, 
      'Unable to load dashboard data'
    )
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Dashboard Error</h2>
          <p className="text-slate-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Show loading state
  if (userLoading || investmentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const totalUnrealized = investments?.reduce((sum, inv) => sum + (inv.unrealizedGainLoss || 0), 0) || 0
  const totalRealized = allInvestments?.reduce((sum, inv) => sum + (inv.realizedPnl || 0), 0) || 0
  const totalMarketValue = investments?.reduce((sum, inv) => sum + (inv.marketValue || 0), 0) || 0
  const netWorth = (user?.cashBalance || 0) + totalMarketValue

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Investor'}
            </h1>
            <p className="text-gray-600 text-lg">Here's your portfolio overview</p>
          </div>
          
          {/* Navigation Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link to="/instruments" className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium">Instruments</span>
            </Link>
            <Link to="/investments" className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <PieChart className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-sm font-medium">Portfolio</span>
            </Link>
            <Link to="/trade" className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Trade</span>
            </Link>
            <Link to="/settings" className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Settings className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Cash Balance</p>
                </div>
              </div>
              <Link to="/transfer" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Add funds
              </Link>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${user?.cashBalance ? parseFloat(user.cashBalance.toString()).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <PieChart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                </div>
              </div>
              <Link to="/investments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${totalMarketValue.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Net Worth</p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${netWorth ? parseFloat(netWorth.toString()).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Cash + Investments
            </div>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${totalUnrealized >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {totalUnrealized >= 0 ? 
                    <ArrowUpRight className="w-5 h-5 text-green-600" /> : 
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  }
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Unrealized Gain/Loss</p>
                  <p className="text-xs text-gray-500">Current positions</p>
                </div>
              </div>
              <Link to="/transactions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                History
              </Link>
            </div>
            <div className={`text-3xl font-bold ${totalUnrealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalUnrealized >= 0 ? '+' : ''}${totalUnrealized.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </div>
            <div className="flex items-center mt-2">
              <div className={`text-sm ${totalUnrealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalUnrealized >= 0 ? '↗' : '↘'} 
                {investments && investments.length > 0 && totalMarketValue > 0 ? 
                  ((totalUnrealized / (totalMarketValue - totalUnrealized)) * 100).toFixed(2) : '0.00'
                }%
              </div>
              <span className="text-gray-500 text-sm ml-1">vs cost basis</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${totalRealized >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {totalRealized >= 0 ? 
                    <TrendingUp className="w-5 h-5 text-green-600" /> : 
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  }
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Realized Gain/Loss</p>
                  <p className="text-xs text-gray-500">All-time closed positions</p>
                </div>
              </div>
              <Link to="/transfers" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                History
              </Link>
            </div>
            <div className={`text-3xl font-bold ${totalRealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalRealized >= 0 ? '+' : ''}${totalRealized.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Lifetime trading performance
            </div>
          </div>
        </div>

        {/* Recent Investments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <PieChart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h2 className="text-xl font-semibold text-gray-900">Active Investments</h2>
                  <p className="text-sm text-gray-500">Your current positions</p>
                </div>
              </div>
              <Link to="/investments" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                View All
                <Eye className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          
          {investments && investments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Name</th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Avg Price</th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {investments.slice(0, 5).map((inv) => (
                    <tr key={inv.instrumentId} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">{inv.symbol.substring(0, 2)}</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{inv.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 hidden md:table-cell">
                        <div className="max-w-xs truncate">{inv.fullName}</div>
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-medium text-gray-900">{inv.quantity}</td>
                      <td className="py-4 px-6 text-right text-sm text-gray-600 hidden sm:table-cell">
                        ${inv.averagePrice.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-medium text-gray-900">
                        ${inv.currentPrice?.toFixed(2) || '-'}
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-medium text-gray-900">
                        ${inv.marketValue?.toLocaleString('en-US', {minimumFractionDigits: 2}) || '-'}
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-medium">
                        <div className={`inline-flex items-center ${(inv.unrealizedGainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(inv.unrealizedGainLoss || 0) >= 0 ? 
                            <ArrowUpRight className="w-3 h-3 mr-1" /> : 
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                          }
                          ${Math.abs(inv.unrealizedGainLoss || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </div>
                        <div className={`text-xs ${(inv.unrealizedGainLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(inv.unrealizedGainLossPercent || 0).toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {investments.length > 5 && (
                <div className="p-4 bg-gray-50 text-center">
                  <Link to="/investments" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View {investments.length - 5} more investments →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h3>
              <p className="text-gray-500 mb-6">Start building your portfolio by making your first trade</p>
              <Link to="/trade" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Start Trading
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
