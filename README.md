# 📈 Portfolio Management Dashboard

A full-stack investment portfolio application demonstrating modern web development skills with real-time market data integration.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

## 🚀 Quick Start

```bash
git clone <repository-url>
cd manulife-test
docker compose up -d

# Access: http://localhost:5173 (Frontend) | http://localhost:3000 (API)
```

## 🎯 Key Features

- **JWT Authentication** - Secure login with refresh token rotation
- **Real-time Portfolio** - Live P&L tracking with Yahoo Finance API integration
- **Trading System** - Buy/sell orders with transaction history
- **Fund Management** - Deposit/withdraw with balance tracking
- **Responsive UI** - Mobile-first design with professional UX
- **Type Safety** - End-to-end TypeScript with Zod validation

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, TanStack Router/Query, Tailwind CSS  
**Backend:** Node.js, Express, PostgreSQL, JWT, Zod validation  
**DevOps:** Docker Compose, ESLint, Prettier, Vitest  
**External:** Yahoo Finance API for real-time market data

## 🏗️ Architecture

```
React Frontend ←→ Express API ←→ PostgreSQL ←→ Yahoo Finance API
```

**Key Components:**
- Authentication middleware with JWT refresh
- Real-time market data caching (5s intervals)
- Comprehensive error handling with user-friendly messages
- Responsive design with loading/empty states
- RESTful API with proper HTTP status codes

## 📊 API Endpoints

```typescript
# Authentication
POST /auth/register, /auth/login, /auth/refresh

# Portfolio Management  
GET  /user/me                    # User profile & cash balance
GET  /investment                 # Portfolio holdings
GET  /instrument                 # Market instruments search
POST /transaction                # Buy/sell orders
POST /transfer                   # Deposit/withdraw funds
GET  /transaction, /transfer     # Transaction history
```

## 🔥 Technical Highlights

### Frontend Architecture
- **TanStack Query** for server state management with caching
- **Type-safe routing** with search params and navigation
- **Error boundaries** with graceful fallbacks and retry mechanisms  
- **Performance optimization** with React.memo and lazy loading

### Backend Architecture  
- **Modular routing** with middleware composition
- **Input validation** using Zod schemas
- **JWT authentication** with automatic refresh and secure cookies
- **Database migrations** with proper indexing for performance

### Code Quality
- **100% TypeScript** coverage with strict mode
- **Comprehensive error handling** across all API calls
- **Responsive design** with mobile-first approach
- **Testing setup** with Vitest and coverage reporting

## 💡 Business Logic

**Portfolio Calculations:**
- **Realized P&L:** Actual gains/losses from completed trades
- **Unrealized P&L:** Current paper gains/losses on open positions  
- **Average Cost Basis:** Weighted average purchase price per security
- **Market Value:** Real-time portfolio valuation

**Risk Management:**
- Cash balance validation before trades
- Position size limits and validation
- Real-time price updates for accurate execution

## 🎨 UI/UX Features

- **Professional Design** - Clean, modern interface with intuitive navigation
- **Real-time Updates** - Live portfolio values and market data
- **Error Handling** - User-friendly error messages with actionable guidance
- **Loading States** - Skeleton screens and progress indicators
- **Mobile Responsive** - Optimized for all device sizes

---

Built to showcase enterprise-level development practices and attention to user experience in financial applications.