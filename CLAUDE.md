# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AlMa Consulting is a web platform for accounting companies to enhance their products, boost productivity, and better serve customers. Built with Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, and Redux Toolkit with RTK Query for state management.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Tech Stack Architecture

### Core Framework
- **Next.js 15.3.5** with App Router (file-based routing)
- **React 19** with concurrent rendering and modern hooks
- **TypeScript** with strict type checking
- **Node.js v22.14.0** required

### State Management
- **Redux Toolkit 2.x** with RTK Query for data fetching and caching
- **React Redux 9.x** for React bindings
- RTK Query handles all API calls, eliminating need for separate data fetching libraries

### Styling & UI
- **Tailwind CSS 4.0** utility-first framework
- **shadcn/ui** component library built on Radix UI
- **Lucide React** for icons

### Authentication
- **Firebase** for authentication (Google OAuth + OTP via email)
- Custom `useAuth` hook wraps Firebase auth with Redux state management

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── (auth)/login/            # Authentication pages (route group)
│   ├── (dashboard)/             # Main app pages (route group)
│   │   └── purchase-orders/     # Purchase orders feature
│   ├── layout.tsx               # Root layout with providers
│   ├── globals.css              # Global styles
│   └── page.tsx                 # Homepage
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── forms/                   # Form components (LoginPage, etc.)
│   ├── features/                # Feature-specific components
│   └── auth/                    # Auth-related components
├── hooks/
│   ├── useAuth.ts               # Authentication hook (Firebase + Redux)
│   └── useStatusOrder.ts        # Purchase order status hook
├── lib/
│   ├── auth.ts                  # Firebase configuration and exports
│   ├── colors.ts                # Centralized color palette
│   ├── constants.ts             # App constants
│   └── utils.ts                 # Utility functions (cn, etc.)
├── store/
│   ├── index.ts                 # Redux store configuration
│   ├── Providers.tsx            # Redux Provider component
│   ├── api/
│   │   ├── baseApi.ts           # RTK Query base API setup
│   │   ├── authApi.ts           # Auth endpoints (sendOTP, verifyOTP)
│   │   └── statusOrderApi.ts    # Purchase order endpoints
│   └── slices/
│       ├── authSlice.ts         # Auth state (user, token)
│       └── masterDataSlice.ts   # Master data state
└── types/
    ├── api.ts                   # API request/response types
    ├── login.ts                 # Login form types
    ├── purchaseOrder.ts         # Purchase order types
    ├── user.ts                  # User types
    └── ui.ts                    # UI component types
```

## Key Architectural Patterns

### Color System
All colors are centralized in `lib/colors.ts`. **Always import colors from this file** rather than hardcoding values:
```typescript
import { colors } from '@/lib/colors';

// Use in inline styles
style={{ backgroundColor: colors.primary }}

// Primary: #0ce4ac (brand green)
// Secondary: #172c3b (dark navy)
// Neutral: #A9A9A9 (gray)
```

### Authentication Flow
1. **OTP Flow** (primary): Email → Send OTP → Verify OTP → Login
2. **Google OAuth** (secondary, optional): Firebase Google sign-in popup

The `useAuth` hook manages:
- `sendOTP(email)` - Send OTP via API
- `verifyOTP(email, otp)` - Verify OTP and set user in Redux
- `signInWithGoogle()` - Google OAuth via Firebase
- User state stored in Redux (`store/slices/authSlice.ts`)

### Redux + RTK Query Integration
Store configuration in `store/index.ts`:
- All API endpoints use RTK Query (no axios/fetch directly)
- Base API configured in `store/api/baseApi.ts`
- Endpoints injected via `api.injectEndpoints()`
- Auto-generated hooks: `useGetXQuery`, `useCreateXMutation`, etc.

Example RTK Query usage:
```typescript
// In component
const { data, isLoading, error } = useGetPurchaseOrdersQuery();
const [createOrder] = useCreatePurchaseOrderMutation();
```

### Component Patterns
- **UI components** (`components/ui/`): Base shadcn components (Button, Input, Card, etc.)
- **Form components** (`components/forms/`): Complete form pages (LoginPage)
- **Feature components** (`components/features/`): Business logic components
- All components use TypeScript with proper interfaces
- Use `cn()` utility from `lib/utils.ts` for conditional class merging

### Route Groups
Next.js 15 App Router uses route groups `(groupName)` for organization without affecting URL structure:
- `(auth)` - Login and auth-related pages
- `(dashboard)` - Main application pages after login

## Design System

### Primary Colors
```css
--primary: #0ce4ac        /* Main brand (green) */
--secondary: #172c3b      /* Dark accent (navy) */
--neutral: #A9A9A9        /* Muted gray */
--destructive: #ef4444    /* Error red */
```

### Responsive Design
Mobile-first approach with Tailwind breakpoints:
- `default` (0px+): Mobile
- `sm` (640px+): Large phones
- `md` (768px+): Tablets
- `lg` (1024px+): Desktop

### Styling Conventions
- Use Tailwind utility classes as primary styling method
- Import colors from `lib/colors.ts` for inline styles
- Responsive: `className="text-sm md:text-base lg:text-lg"`
- Use `cn()` for conditional classes: `cn("base-class", condition && "conditional-class")`

## Important Implementation Notes

### Environment Variables
Required in `.env.local`:
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# API Configuration
NEXT_PUBLIC_API_URL=http://auto.digital.almafconsultora.com:8080/api
NEXT_PUBLIC_WEBHOOK_URL=https://auto.digital.almafconsultora.com:8080
```

**Note**:
- `NEXT_PUBLIC_API_URL` uses HTTP for standard API endpoints
- `NEXT_PUBLIC_WEBHOOK_URL` uses HTTPS for webhook endpoints (export functionality)

### API Integration
- Base API URL configured in `store/api/baseApi.ts`
- All endpoints follow REST conventions
- RTK Query handles caching, loading states, and error handling automatically
- Use `providesTags` and `invalidatesTags` for cache management

### State Management Best Practices
- **Server state**: Use RTK Query (API data, cached)
- **Client state**: Use Redux slices (auth, UI state)
- **Local state**: Use React useState for component-specific state
- Access store with typed hooks: `useAppDispatch()`, `useAppSelector()`

### Type Safety
- All API responses have TypeScript interfaces in `types/`
- Redux state is fully typed with `RootState` and `AppDispatch`
- Component props use TypeScript interfaces
- RTK Query auto-generates typed hooks from endpoint definitions

## Common Development Patterns

### Creating New API Endpoints
1. Add endpoint to appropriate API file in `store/api/`
2. Define TypeScript types in `types/`
3. Use `builder.query()` for GET, `builder.mutation()` for POST/PUT/DELETE
4. Export auto-generated hooks
5. Use hooks in components

### Adding New Components
1. Place in appropriate directory (`ui/`, `forms/`, `features/`)
2. Use TypeScript with proper interface for props
3. Import colors from `lib/colors.ts`
4. Make responsive with Tailwind breakpoints
5. Export as named export

### Authentication Guards
- Protected routes should check user state from Redux
- Redirect to `/login` if not authenticated
- User data available via `useAuth()` hook or `useAppSelector(state => state.auth.user)`

## PWA Configuration

PWA capabilities via `next-pwa` package. Configuration in `next.config.ts` enables:
- Service worker for offline support
- App manifest for installation
- Caching strategies for assets and API calls

## Mobile-First Development

All UI must be designed mobile-first:
- Touch targets minimum 44px × 44px
- Adequate spacing between interactive elements
- Test on mobile viewport first
- Progressive enhancement for larger screens
- Use appropriate input types for mobile keyboards
