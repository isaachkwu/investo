import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, Building2, Volume2, AlertCircle, RefreshCcw } from 'lucide-react'
import api from '../lib/api'
import { getErrorMessage } from '../utils/errorHandling'

type InstrumentDetail = {
  instrumentId: string
  fullName: string
  symbol: string
  instrumentType: string
  textDescription: string | null
  price?: number
  currency?: string
  quote?: {
    previousClose: number | null
    open: number | null
    dayLow: number | null
    dayHigh: number | null
    change: number | null
    changePercent: number | null
    marketCap: number | null
    volume: number | null
    avgVolume3m: number | null
    fiftyTwoWeekLow: number | null
  }
}

export default function InstrumentDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }

  const { data: instrument, isLoading, error } = useQuery({
    queryKey: ['instrument', id],
    queryFn: async () => {
      const res = await api.get(`/instrument/${id}`)
      return res.data as InstrumentDetail
    },
    refetchInterval: 5 * 1000, // Refresh every 5 seconds
  })

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Instrument</h2>
          <p className="text-slate-600 mb-4">{getErrorMessage(error, 'Unable to load instrument details')}</p>
          <div className="flex gap-3 justify-center">
            <Link 
              to="/instruments" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Instruments
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

  if (isLoading || !instrument) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading instrument details...</p>
        </div>
      </div>
    )
  }

  const isPositive = instrument.quote?.change && instrument.quote.change >= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{instrument.fullName}</h1>
                <p className="text-blue-100 text-lg">({instrument.symbol}) • {instrument.instrumentType}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                to="/instruments" 
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <Link 
                to='/trade' 
                search={{ instrumentId: id }} 
                className="flex items-center gap-2 px-6 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Trade
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 -mt-4">{/* Overlap effect */}

        {/* Price Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <DollarSign className="w-4 h-4" />
                Current Price
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                ${instrument.price?.toFixed(2) || '-'}
              </div>
              {instrument.quote?.change !== null && instrument.quote?.change !== undefined && (
                <div className={`flex items-center gap-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">
                    {isPositive ? '+' : ''}{instrument.quote.change.toFixed(2)} 
                    ({isPositive ? '+' : ''}{instrument.quote.changePercent?.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-slate-600 mb-2">Instrument Type</div>
              <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 w-fit">
                <Building2 className="w-4 h-4 mr-2" />
                {instrument.instrumentType}
              </div>
            </div>
          </div>
        </div>

        {instrument.quote && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">Market Data</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  Previous Close
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  ${instrument.quote.previousClose?.toFixed(2) || '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Open
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  ${instrument.quote.open?.toFixed(2) || '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Day Range
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  ${instrument.quote.dayLow?.toFixed(2)} - ${instrument.quote.dayHigh?.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Volume
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {instrument.quote.volume?.toLocaleString() || '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  Avg Volume (3M)
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {instrument.quote.avgVolume3m?.toLocaleString() || '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Market Cap
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {instrument.quote.marketCap ? '$' + (instrument.quote.marketCap / 1e9).toFixed(2) + 'B' : '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  52W Low
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  ${instrument.quote.fiftyTwoWeekLow?.toFixed(2) || '-'}
                </div>
              </div>
            </div>
          </div>
        )}

        {instrument.textDescription && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">About {instrument.symbol}</h2>
            </div>
            <p className="text-slate-700 leading-relaxed">{instrument.textDescription}</p>
          </div>
        )}
      </div>
    </div>
  )
}
