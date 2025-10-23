import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearch } from '@tanstack/react-router'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Hash, Calculator, CheckCircle, AlertCircle, History, PieChart } from 'lucide-react'
import api from '../lib/api'
import { getErrorMessage } from '../utils/errorHandling'

type Instrument = {
  instrumentId: string
  fullName: string
  symbol: string
  price?: number
}

export default function TradePage() {
  const queryClient = useQueryClient()
  const search = useSearch({ from: '/trade' }) as any
  const [type, setType] = useState<'buy' | 'sell'>('buy')
  const [instrumentId, setInstrumentId] = useState(search.instrumentId || '')
  const [quantity, setQuantity] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  useEffect(() => {
    if (instrumentId) {
      setPricePerUnit(instruments?.find(inst => inst.instrumentId === instrumentId)?.price?.toString() || '')
    }
  }, [instrumentId])

  const { data: instruments, error: instrumentsError } = useQuery({
    queryKey: ['instruments-search'],
    queryFn: async () => {
      const res = await api.get('/instrument?pageSize=100')
      return res.data as Instrument[]
    },
  })

  const trade = useMutation({
    mutationFn: async () => {
      await api.post('/transaction', {
        type,
        instrumentId,
        quantity: Number(quantity),
        pricePerUnit: Number(pricePerUnit),
      })
    },
    onSuccess: () => {
      setSuccess(`${type === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares successfully!`)
      setError(null)
      setQuantity('')
      setPricePerUnit('')
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
    onError: (error: any) => {
      setError(getErrorMessage(error, 'Trade failed. Please try again.'))
      setSuccess(null)
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-900">Trade Center</h1>
              <p className="text-gray-600">Buy and sell financial instruments</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Place Order</h2>
                <p className="text-sm text-gray-500 mt-1">Enter your trade details below</p>
              </div>
              
              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-green-700">{success}</div>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    trade.mutate()
                  }}
                  className="space-y-6"
                >
                  {/* Trade Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Order Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setType('buy')}
                        className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all ${
                          type === 'buy' 
                            ? 'bg-green-600 border-green-600 text-white shadow-md' 
                            : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'
                        }`}
                      >
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Buy
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('sell')}
                        className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all ${
                          type === 'sell' 
                            ? 'bg-red-600 border-red-600 text-white shadow-md' 
                            : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'
                        }`}
                      >
                        <TrendingDown className="w-5 h-5 mr-2" />
                        Sell
                      </button>
                    </div>
                  </div>

                  {/* Instrument Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Instrument
                    </label>
                    <div className="relative">
                      {instrumentsError ? (
                        <div className="w-full p-3 border border-red-300 rounded-lg bg-red-50 text-red-700 text-sm">
                          Error loading instruments. Please refresh the page.
                        </div>
                      ) : (
                        <select
                          value={instrumentId}
                          onChange={(e) => setInstrumentId(e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Choose an instrument...</option>
                          {instruments?.map((inst) => (
                            <option key={inst.instrumentId} value={inst.instrumentId}>
                              {inst.symbol} - {inst.fullName} {inst.price ? `($${inst.price.toFixed(2)})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Quantity Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Price Per Unit Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Per Unit
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={pricePerUnit}
                          onChange={(e) => setPricePerUnit(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  {quantity && pricePerUnit && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Order Summary</span>
                        <Calculator className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          Total Amount
                        </span>
                        <span className={`text-2xl font-bold ${type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                          ${(Number(quantity) * Number(pricePerUnit)).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {quantity} shares × ${Number(pricePerUnit).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={trade.isPending || !instrumentId || !quantity || !pricePerUnit}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      type === 'buy' 
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-200' 
                        : 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-200'
                    }`}
                  >
                    {trade.isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      `${type === 'buy' ? 'Buy' : 'Sell'} ${quantity || ''} Shares`
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <History className="w-5 h-5 mr-2 text-blue-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link 
                  to="/transactions" 
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <History className="w-4 h-4 mr-3 text-gray-500" />
                  Transaction History
                </Link>
                <Link 
                  to="/investments" 
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <PieChart className="w-4 h-4 mr-3 text-gray-500" />
                  View Portfolio
                </Link>
              </div>
            </div>

            {/* Market Info Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Status</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                  Open
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Markets are currently open for trading
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
