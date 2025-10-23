import React from 'react'
import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { getToken } from './state/auth'
import DashboardPage from './routes/dashboard'
import LoginPage from './routes/login'
import RegisterPage from './routes/register'
import InstrumentsPage from './routes/instruments'
import InstrumentDetailPage from './routes/instruments.$id'
import InvestmentsPage from './routes/investments'
import TradePage from './routes/trade'
import SettingsPage from './routes/settings'
import TransferPage from './routes/transfer'
import TransfersPage from './routes/transfers'
import TransactionsPage from './routes/transactions'

const queryClient = new QueryClient()

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const protectedBeforeLoad = () => {
  const token = getToken()
  if (!token) throw redirect({ to: '/login' })
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: protectedBeforeLoad,
  component: DashboardPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

const instrumentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/instruments',
  beforeLoad: protectedBeforeLoad,
  component: InstrumentsPage,
})

const instrumentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/instruments/$id',
  beforeLoad: protectedBeforeLoad,
  component: InstrumentDetailPage,
})

const investmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments',
  beforeLoad: protectedBeforeLoad,
  component: InvestmentsPage,
})

const tradeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trade',
  beforeLoad: protectedBeforeLoad,
  component: TradePage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: protectedBeforeLoad,
  component: SettingsPage,
})

const transferRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transfer',
  beforeLoad: protectedBeforeLoad,
  component: TransferPage,
})

const transfersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transfers',
  beforeLoad: protectedBeforeLoad,
  component: TransfersPage,
})

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  beforeLoad: protectedBeforeLoad,
  component: TransactionsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  instrumentsRoute,
  instrumentDetailRoute,
  investmentsRoute,
  tradeRoute,
  settingsRoute,
  transferRoute,
  transfersRoute,
  transactionsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
