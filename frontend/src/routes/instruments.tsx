import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Search, Filter, TrendingUp, ArrowLeft, Eye, ShoppingCart, BarChart3, AlertCircle, RefreshCcw } from 'lucide-react'
import api from '../lib/api'
import { getErrorMessage } from '../utils/errorHandling'

type Instrument = {
  instrumentId: string
  fullName: string
  symbol: string
  instrumentType: string
  price?: number
  currency?: string
}

export default function InstrumentsPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')

  const { data: instruments, isLoading, error } = useQuery({
    queryKey: ['instruments', search, type],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('nameOrSymbol', search)
      if (type) params.append('instrumentType', type)
      params.append('pageSize', '50')
      const res = await api.get(`/instrument?${params}`)
      return res.data as Instrument[]
    },
    refetchInterval: 5 * 1000, // Refresh every 5 seconds
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <div className="mb-6 sm:mb-0">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">Market Instruments</h1>
                <p className="text-gray-600">Discover and trade financial instruments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)} 
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[180px]"
              >
                <option value="">All Types</option>
                <option value="stock">Stock</option>
                <option value="bond">Bond</option>
                <option value="etf">ETF</option>
                <option value="mutual_fund">Mutual Fund</option>
              </select>
            </div>
          </div>
        </div>

        {/* Instruments Grid/Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {error ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Instruments</h3>
              <p className="text-gray-600 mb-4">{getErrorMessage(error, 'Unable to load market instruments')}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading instruments...</p>
            </div>
          ) : instruments && instruments.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Instrument</th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {instruments.map((inst) => (
                      <tr key={inst.instrumentId} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{inst.symbol.substring(0, 2)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{inst.symbol}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{inst.fullName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            inst.instrumentType === 'stock' ? 'bg-green-100 text-green-800' :
                            inst.instrumentType === 'bond' ? 'bg-blue-100 text-blue-800' :
                            inst.instrumentType === 'etf' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inst.instrumentType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {inst.price ? (
                            <div className="text-sm font-medium text-gray-900">
                              ${inst.price.toLocaleString('en-US', {minimumFractionDigits: 2})}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link 
                              to='/instruments/$id' 
                              params={{id: inst.instrumentId}} 
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Link>
                            <Link 
                              to='/trade' 
                              search={{ instrumentId: inst.instrumentId}} 
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Trade
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="lg:hidden">
                {instruments.map((inst) => (
                  <div key={inst.instrumentId} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{inst.symbol.substring(0, 2)}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{inst.symbol}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            inst.instrumentType === 'stock' ? 'bg-green-100 text-green-800' :
                            inst.instrumentType === 'bond' ? 'bg-blue-100 text-blue-800' :
                            inst.instrumentType === 'etf' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inst.instrumentType.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {inst.price && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${inst.price.toLocaleString('en-US', {minimumFractionDigits: 2})}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm text-gray-600">{inst.fullName}</div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        to='/instruments/$id' 
                        params={{id: inst.instrumentId}} 
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                      <Link 
                        to='/trade' 
                        search={{ instrumentId: inst.instrumentId}} 
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Trade
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No instruments found</h3>
              <p className="text-gray-500 mb-4">
                {search || type ? 'Try adjusting your search or filter criteria' : 'No instruments are currently available'}
              </p>
              {(search || type) && (
                <button 
                  onClick={() => {setSearch(''); setType('')}} 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
