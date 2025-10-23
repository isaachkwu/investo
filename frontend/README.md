# Investo Frontend

React + TypeScript frontend for the Investo portfolio management application.

## Features

- 🔐 User authentication (login/register)
- 📊 Dashboard with portfolio overview
- 💰 Real-time investment tracking with unrealized gains/losses
- 📈 Instrument search and details
- 💵 Buy/Sell trading interface
- ⚙️ User settings and logout

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **TanStack Router** for routing
- **TanStack Query** for data fetching and caching
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Zod** for validation

## Getting Started

### Prerequisites

- Node.js 18+ (check with `node --version`)
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/          # Reusable UI components
│   ├── lib/
│   │   ├── api.ts       # Axios instance with interceptors
│   │   └── utils.ts     # Utility functions
│   ├── routes/          # Page components
│   │   ├── dashboard.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── instruments.tsx
│   │   ├── instruments.$id.tsx
│   │   ├── investments.tsx
│   │   ├── trade.tsx
│   │   └── settings.tsx
│   ├── state/
│   │   └── auth.ts      # Auth token management
│   ├── index.css        # Global styles and Tailwind imports
│   ├── main.tsx         # App entry point
│   └── router.tsx       # Route configuration
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Key Features

### Authentication
- JWT-based authentication
- Automatic token refresh on 401 errors
- Protected routes redirect to login

### Dashboard
- Cash balance display
- Portfolio value calculation
- Net worth (cash + investments)
- Unrealized gains/losses summary
- Investment holdings table

### Trading
- Buy/sell interface
- Real-time price display
- Total calculation
- Success/error feedback

### Investments
- Full portfolio view
- Gain/loss metrics per holding
- Cost basis tracking

### Instruments
- Search and filter
- Real-time price data
- Direct trade links

## API Integration

The app communicates with the backend API at `http://localhost:3000`:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `GET /user/me` - Get current user
- `GET /instrument` - List instruments
- `GET /instrument/:id` - Get instrument details
- `GET /investment` - List investments
- `GET /investment/:instrumentId` - Get investment details
- `POST /transaction` - Create buy/sell transaction

## Development

### TypeScript Errors
The project is configured with TypeScript. Run type checking with:
```bash
npx tsc --noEmit
```

### Code Style
The project uses Prettier for code formatting. Format all files:
```bash
npx prettier --write .
```

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, modify `vite.config.ts`:
```typescript
server: {
  port: 5174,
  strictPort: false
}
```

### API Connection Issues
- Ensure backend is running on `http://localhost:3000`
- Check `.env` file has correct `VITE_API_BASE_URL`
- Verify no CORS issues in browser console

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Docker Support

The frontend can be run in Docker (see root `docker-compose.yml`).

Build and run:
```bash
docker compose up frontend
```

## License

MIT
