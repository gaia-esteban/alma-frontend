# AlMa Consulting - Frontend Development Guidelines

## Overview
Alma Consulting is a web platform to allow accounting companies to enhance their products to boost productivity and better serve customers.

## Tech Stack

### Core Framework & Runtime
- **React**: v19.x - Modern React with latest features including concurrent rendering and improved hooks
- **Next.js**: v15.3.4 - Full-stack React framework with App Router for optimal performance and SEO
- **TypeScript**: Latest stable version - Type safety and enhanced developer experience
- **Node.js**: v22.14.0 - JavaScript runtime for development and build processes

### Styling & UI
- **Tailwind CSS**: v4.0 - Utility-first CSS framework for rapid UI development
- **shadcn/ui**: Latest version - High-quality, accessible component library built on Radix UI
- **Lucide React**: Consistent, customizable icon library with tree-shaking support

### State Management & Data Fetching
- **Redux Toolkit**: v2.x - Modern Redux with simplified setup, includes RTK Query for data fetching
- **React Redux**: v9.x - Official React bindings for Redux state management

**RTK Query Role**: RTK Query is bundled within Redux Toolkit and serves as the data fetching and caching solution. It eliminates the need for separate data fetching libraries by providing built-in caching, background updates, and optimistic updates. RTK Query handles API calls, cache invalidation, and loading states automatically, reducing boilerplate code significantly.

### Development Tools
- **ESLint v9.0**: Static analysis tool that identifies and reports code quality issues, enforces coding standards, and catches potential bugs before runtime. Configured with Next.js and TypeScript rules for optimal development experience.

- **Prettier**: Opinionated code formatter that automatically formats code according to defined rules, ensuring consistent code style across the team and eliminating formatting debates.

- **Husky**: Git hooks manager that runs scripts at specific Git lifecycle events (pre-commit, pre-push, etc.), enabling automated code quality checks before code is committed or pushed.

- **lint-staged**: Runs linters and formatters only on staged files in Git, improving performance by avoiding full project scans and ensuring only modified code is checked.

### PWA & Performance
- **next-pwa**: v5.x - Adds Progressive Web App capabilities to Next.js applications with service worker generation and caching strategies
- **Sharp**: Automatic image optimization library used by Next.js for converting and resizing images

## Design System

### Color Palette
```css
:root {
  --primary: #0ce4ac;        /* Main brand color - buttons, links, highlights */
  --secondary: #172c3b;      /* Dark accent - headers, navigation, text */
  --neutral: #A9A9A9;        /* Muted color - borders, placeholders, disabled states */
  
  /* Derived colors for comprehensive design system */
  --primary-foreground: #000000;      /* Text on primary background */
  --secondary-foreground: #ffffff;    /* Text on secondary background */
  --muted: #f5f5f5;                  /* Light backgrounds, cards */
  --muted-foreground: #737373;       /* Secondary text */
  --destructive: #ef4444;            /* Error states, delete actions */
  --destructive-foreground: #ffffff; /* Text on destructive background */
  --border: #e5e5e5;                /* Default border color */
  --input: #ffffff;                  /* Input field backgrounds */
  --ring: #0ce4ac;                  /* Focus ring color */
}
```

### Tailwind Configuration
Custom colors are essential for maintaining brand consistency throughout the application. Configure in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0ce4ac',
          50: '#f0fdf9',
          100: '#ccfbef',
          500: '#0ce4ac',
          600: '#0bc49a',
          900: '#064e3b',
        },
        secondary: {
          DEFAULT: '#172c3b',
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#172c3b',
          600: '#0f172a',
          900: '#020617',
        },
        neutral: '#A9A9A9',
      }
    }
  }
}
```

This configuration provides color variations (50, 100, 500, 600, 900) for different UI states and hover effects while maintaining accessibility contrast ratios.

## Project Architecture

### Folder Structure
```
src/
├── app/                              # Next.js 15 App Router - file-based routing
│   ├── (auth)/                       # Route groups - auth pages (login, register)
│   │   ├── login/
│   │   │   └── page.tsx             # Login page component
│   │   └── register/
│   │       └── page.tsx             # Registration page component
│   ├── (dashboard)/                  # Route groups - main app pages
│   │   ├── purchase-orders/
│   │   │   ├── page.tsx             # PO listing page
│   │   │   ├── [id]/                # Dynamic route for PO details
│   │   │   │   └── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx         # Create new PO page
│   │   ├── vendors/
│   │   │   └── page.tsx             # Vendor management
│   │   └── reports/
│   │       └── page.tsx             # Reporting dashboard
│   ├── api/                         # API routes (if needed for server-side logic)
│   │   └── auth/
│   │       └── route.ts             # Authentication endpoints
│   ├── globals.css                  # Global styles, Tailwind imports
│   ├── layout.tsx                   # Root layout - providers, metadata
│   ├── loading.tsx                  # Global loading UI component
│   ├── not-found.tsx               # 404 error page
│   └── page.tsx                    # Homepage/landing page
├── components/                      # Reusable UI components
│   ├── ui/                         # shadcn/ui base components (Button, Input, etc.)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── forms/                      # Form-specific components
│   │   ├── PurchaseOrderForm.tsx
│   │   ├── VendorForm.tsx
│   │   └── FormField.tsx
│   ├── layout/                     # Layout and navigation components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── features/                   # Business logic components
│       ├── purchase-orders/
│       │   ├── PurchaseOrderCard.tsx
│       │   ├── PurchaseOrderTable.tsx
│       │   └── StatusBadge.tsx
│       └── vendors/
│           ├── VendorSelector.tsx
│           └── VendorCard.tsx
├── hooks/                          # Custom React hooks for reusable logic
│   ├── useAuth.ts                  # Authentication state and methods
│   ├── usePurchaseOrders.ts        # PO-specific data fetching
│   ├── useLocalStorage.ts          # Browser storage utilities
│   └── useDebounce.ts              # Performance optimization hooks
├── lib/                            # Utility functions and configurations
│   ├── utils.ts                    # General utility functions (cn, formatters)
│   ├── validations.ts              # Zod schemas for form and API validation
│   ├── constants.ts                # Application constants (URLs, limits, etc.)
│   ├── api.ts                      # RTK Query base API configuration
│   └── auth.ts                     # Authentication utilities
├── store/                          # Redux store and state management
│   ├── index.ts                    # Store configuration and setup
│   ├── api/                        # RTK Query API endpoints
│   │   ├── purchaseOrdersApi.ts    # PO CRUD operations
│   │   ├── vendorsApi.ts           # Vendor management endpoints
│   │   └── authApi.ts              # Authentication endpoints
│   └── slices/                     # Redux slices for local state
│       ├── authSlice.ts            # User authentication state
│       └── uiSlice.ts              # UI state (modals, loading, etc.)
├── types/                          # TypeScript type definitions
│   ├── index.ts                    # Main type exports
│   ├── api.ts                      # API response/request types
│   ├── purchaseOrder.ts            # PO-related types
│   └── user.ts                     # User and authentication types
├── styles/                         # Additional CSS files (if needed beyond Tailwind)
│   └── components.css              # Component-specific styles
└── middleware.ts                   # Next.js middleware for auth/routing
```

### Component Architecture

Components should follow a consistent pattern for maintainability and reusability:

```typescript
// components/features/UserProfile/UserProfile.tsx
import { cn } from '@/lib/utils';

interface UserProfileProps {
  className?: string;
  user: User;
  onEdit?: () => void;
}

export function UserProfile({ className, user, onEdit, ...props }: UserProfileProps) {
  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      <h2 className="text-lg font-semibold">{user.name}</h2>
      {onEdit && (
        <button onClick={onEdit} className="mt-2 text-primary hover:underline">
          Edit Profile
        </button>
      )}
    </div>
  );
}
```

**Component Categories:**
1. **UI Components** (`components/ui/`): Basic, unstyled components from shadcn/ui that can be customized
2. **Layout Components** (`components/layout/`): Page structure components like headers, sidebars, and navigation
3. **Feature Components** (`components/features/`): Business logic components specific to purchase orders, vendors, etc.
4. **Form Components** (`components/forms/`): Reusable form inputs, validation, and submission handling

## State Management with Redux Toolkit & RTK Query

### Store Configuration
Configure the Redux store with RTK Query integration for optimal caching and data synchronization:

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import authSlice from './slices/authSlice';

export const store = configureStore({
  reducer: {
    api: api.reducer,
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['api/executeQuery/fulfilled'],
      },
    }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### API Implementation Guidelines

**Endpoint Structure**: Each API slice should define CRUD operations with proper TypeScript typing:

```typescript
// store/api/purchaseOrdersApi.ts
import { api } from './baseApi';

export const purchaseOrdersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /purchase-orders - Fetch all POs with filtering
    getPurchaseOrders: builder.query<PurchaseOrder[], { status?: string; vendor?: string }>({
      query: (params) => ({
        url: '/purchase-orders',
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'PurchaseOrder' as const, id })), 'PurchaseOrder']
          : ['PurchaseOrder'],
    }),
    
    // POST /purchase-orders - Create new PO
    createPurchaseOrder: builder.mutation<PurchaseOrder, CreatePurchaseOrderRequest>({
      query: (data) => ({
        url: '/purchase-orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),
  }),
});

export const { useGetPurchaseOrdersQuery, useCreatePurchaseOrderMutation } = purchaseOrdersApi;
```

**Query Patterns**: Use queries for data fetching with automatic caching and background updates:
- Implement optimistic updates for better UX
- Use `keepUnusedDataFor` to control cache lifetime
- Leverage `refetchOnFocus` and `refetchOnReconnect` for data freshness

**Cache Management**: RTK Query automatically manages cache invalidation through tags:
- Use descriptive tags ('PurchaseOrder', 'Vendor', 'User')
- Invalidate specific items or entire collections based on mutations
- Implement selective cache updates for performance optimization

## Mobile-First Approach

### Responsive Design Implementation
**Mobile-First Strategy**: Start with mobile styles and progressively enhance for larger screens:

```css
/* Mobile-first approach */
.purchase-order-card {
  @apply p-3 text-sm; /* Mobile base styles */
}

@screen sm {
  .purchase-order-card {
    @apply p-4 text-base; /* Small tablets */
  }
}

@screen lg {
  .purchase-order-card {
    @apply p-6 text-lg; /* Desktop */
  }
}
```

**Touch Interface Guidelines**:
- Minimum touch target size: 44px × 44px
- Adequate spacing between interactive elements (8px minimum)
- Implement touch feedback with hover and active states
- Use appropriate input types for mobile keyboards

### Tailwind Breakpoint Usage
**Breakpoint Definitions**:
- `default`: 0px+ (mobile phones)
- `sm`: 640px+ (large phones, small tablets)
- `md`: 768px+ (tablets)
- `lg`: 1024px+ (small desktops)
- `xl`: 1280px+ (large desktops)
- `2xl`: 1536px+ (extra large screens)

**Implementation Patterns**:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid: 1 column mobile, 2 tablet, 3 desktop */}
</div>

<button className="w-full sm:w-auto px-4 py-2">
  {/* Full width mobile, auto width larger screens */}
</button>
```

## Progressive Web App (PWA)

### PWA Setup and Configuration
Configure PWA capabilities for offline functionality and app-like experience:

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.savia\.com\/.*$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});
```

### Required PWA Assets
- **Manifest file** (`public/manifest.json`): App metadata, theme colors, display mode
- **Icons**: Multiple sizes (192x192, 512x512) for different devices and contexts
- **Service Worker**: Automatically generated by next-pwa for caching and offline functionality

## Code Quality & Standards

### TypeScript Configuration
Enable strict type checking for robust development:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### ESLint Setup
Comprehensive linting rules for code quality and consistency:

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration
Consistent code formatting across the project:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Authentication & Security

### Route Protection Strategy
Implement authentication middleware for securing protected routes:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Security Best Practices**:
- Implement CSRF protection using Next.js built-in features
- Use secure HTTP-only cookies for authentication tokens
- Validate all user inputs using Zod schemas
- Implement proper error boundaries to prevent information leakage

## Performance Guidelines

### Bundle Optimization Strategies
**Dynamic Imports**: Use code splitting for better initial load performance:

```typescript
// Lazy load heavy components
const PurchaseOrderChart = dynamic(() => import('./PurchaseOrderChart'), {
  loading: () => <div>Loading chart...</div>,
});

// Lazy load entire pages
const ReportsPage = dynamic(() => import('./ReportsPage'), {
  ssr: false, // Client-side only if needed
});
```

**Image Optimization**: Leverage Next.js Image component:

```jsx
import Image from 'next/image';

<Image
  src="/purchase-order-icon.png"
  alt="Purchase Order"
  width={32}
  height={32}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**Font Optimization**: Use Next.js font optimization:

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

## Naming Conventions

### File and Directory Naming
- **Components**: PascalCase (`PurchaseOrderCard.tsx`)
- **Pages**: lowercase with hyphens (`purchase-orders/page.tsx`)
- **Hooks**: camelCase with 'use' prefix (`usePurchaseOrders.ts`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase with descriptive suffixes (`PurchaseOrderType.ts`)

### Variable and Function Naming
```typescript
// Variables: camelCase
const purchaseOrderList = [];
const isLoading = false;

// Functions: camelCase with verb prefix
const handleSubmit = () => {};
const fetchPurchaseOrders = async () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.savia.com';

// Components: PascalCase
const PurchaseOrderForm = () => {};
```

### Git Commit Conventions
Follow conventional commits for clear project history:

- `feat: add purchase order approval workflow`
- `fix: resolve vendor selection bug in mobile view`
- `docs: update API documentation for purchase orders`
- `style: improve mobile responsiveness of dashboard`
- `refactor: optimize purchase order data fetching`
- `chore: update dependencies and build configuration`

## Documentation Standards

### Code Documentation Requirements
**Component Documentation**: Use JSDoc for complex components:

```typescript
/**
 * PurchaseOrderCard displays summary information for a purchase order
 * 
 * @param purchaseOrder - The purchase order data to display
 * @param onStatusChange - Callback when PO status is updated
 * @param className - Additional CSS classes for styling
 * @param showActions - Whether to display action buttons (default: true)
 */
export function PurchaseOrderCard({
  purchaseOrder,
  onStatusChange,
  className,
  showActions = true
}: PurchaseOrderCardProps) {
  // Component implementation
}
```

**API Documentation**: Document all RTK Query endpoints with descriptions, parameters, and return types:

```typescript
/**
 * Purchase Orders API endpoints
 * Handles CRUD operations for purchase order management
 */
export const purchaseOrdersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Retrieves purchase orders with optional filtering
     * @param filters - Object containing status, vendor, date range filters
     * @returns Promise<PurchaseOrder[]> - Array of purchase orders
     */
    getPurchaseOrders: builder.query<PurchaseOrder[], PurchaseOrderFilters>({
      // Implementation
    }),
  }),
});
```

## Environment Configuration

### Environment Variables Management
```bash
# .env.local - Development environment
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Savia 2.0
NEXT_PUBLIC_APP_VERSION=2.0.0

# Private variables (server-side only)
DATABASE_URL=postgresql://username:password@localhost:5432/savia
AUTH_SECRET=your-secret-key
API_KEY=your-api-key
```

### Development Scripts Configuration
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky install"
  }
}
```

## Deployment Considerations

### Build Optimization
**Bundle Analysis**: Regular monitoring of bundle size and optimization:

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze bundle
npm run build && npm run analyze
```

**Performance optimizations**:
- Enable compression (gzip/brotli)
- Implement proper caching headers
- Use CDN for static assets
- Optimize images with next/image
- Implement code splitting at route level

### Security Best Practices

**Input Validation**: Use Zod for runtime type checking and validation:

```typescript
import { z } from 'zod';

const CreatePurchaseOrderSchema = z.object({
  vendorId: z.string().uuid(),
  items: z.array(z.object({
    description: z.string().min(1).max(200),
    quantity: z.number().positive(),
    price: z.number().positive(),
  })),
  expectedDelivery: z.date().min(new Date()),
});

export type CreatePurchaseOrderRequest = z.infer<typeof CreatePurchaseOrderSchema>;
```

**Dependency Security**: Regular security audits and updates:
- Run `npm audit` before each deployment
- Keep dependencies up to date
- Use tools like Snyk or Dependabot for automated security monitoring
- Implement Content Security Policy (CSP) headers

This comprehensive guide should be updated as the project evolves and new requirements emerge. All team members should be familiar with these guidelines and follow them consistently for optimal development experience and product quality.