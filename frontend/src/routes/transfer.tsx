import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '../utils/errorHandling'

interface CreateTransferRequest {
  amount: number
  transferType: 'deposit' | 'withdraw'
}

interface CreateTransferResponse {
  cashBalance: string
  newTransfer: {
    transferId: number
    amount: string
    transferType: 'deposit' | 'withdraw'
    transferDate: string
    userId: number
  }
}

export default function TransferPage() {
  const [amount, setAmount] = useState('')
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit')
  const queryClient = useQueryClient()

  const createTransferMutation = useMutation({
    mutationFn: async (data: CreateTransferRequest): Promise<CreateTransferResponse> => {
      const response = await api.post('/transfer', data)
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate user data to refresh cash balance
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      
      // Reset form
      setAmount('')
      
      // Show success message (you can add toast later)
      alert(`${transferType === 'deposit' ? 'Deposit' : 'withdraw'} successful! New balance: $${Number(data.cashBalance).toLocaleString()}`)
    },
    onError: (error: any) => {
      console.error('Transfer failed:', error)
      const message = getErrorMessage(error, 'Transfer failed. Please try again.')
      alert(`Error: ${message}`)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    createTransferMutation.mutate({
      amount: numAmount,
      transferType
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Manage Cash</h1>
          <p className="text-gray-600 mt-2">Deposit or withdraw funds from your account</p>
        </div>

        {/* Transfer Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transfer Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Transaction Type
              </label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={transferType === 'deposit' ? 'default' : 'outline'}
                  onClick={() => setTransferType('deposit')}
                  className="flex-1 flex items-center justify-center"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Deposit
                </Button>
                <Button
                  type="button"
                  variant={transferType === 'withdraw' ? 'default' : 'outline'}
                  onClick={() => setTransferType('withdraw')}
                  className="flex-1 flex items-center justify-center"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {transferType === 'withdraw' && (
                <p className="mt-1 text-sm text-amber-600">
                  ⚠️ Ensure you have sufficient funds before withdrawing
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createTransferMutation.isPending || !amount}
              className="w-full"
            >
              {createTransferMutation.isPending
                ? `Processing ${transferType}...`
                : `${transferType === 'deposit' ? 'Deposit' : 'Withdraw'} $${amount || '0.00'}`
              }
            </Button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/transfers" className="block">
              <Button variant="outline" className="w-full">
                View Transfer History
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                View Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}