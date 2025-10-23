import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, User, Mail, Hash, DollarSign, LogOut, Settings as SettingsIcon, Shield, AlertCircle } from 'lucide-react'
import { clearTokens } from '../state/auth'
import api from '../lib/api'
import { getErrorMessage } from '../utils/errorHandling'

type User = {
  userId: string
  name: string
  email: string
  cashBalance: number
}

export default function SettingsPage() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/user/me')
      return res.data as User
    },
  })

  const handleLogout = () => {
    clearTokens()
    window.location.href = '/login'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Account</h2>
          <p className="text-slate-600 mb-4">{getErrorMessage(error, 'Unable to load account information')}</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading account information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Account Settings</h1>
                <p className="text-slate-300">Manage your account preferences</p>
              </div>
            </div>
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 -mt-4">
        {/* Account Information Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <div className="text-lg font-semibold text-slate-900 p-3 bg-slate-50 rounded-lg">
                {user.name}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <div className="text-lg font-semibold text-slate-900 p-3 bg-slate-50 rounded-lg">
                {user.email}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                User ID
              </div>
              <div className="text-sm font-mono text-slate-700 p-3 bg-slate-50 rounded-lg">
                {user.userId}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cash Balance
              </div>
              <div className="text-lg font-semibold text-green-600 p-3 bg-green-50 rounded-lg">
                ${user.cashBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Actions Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-slate-900">Security</h2>
          </div>
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">
              Manage your account security and session preferences.
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
