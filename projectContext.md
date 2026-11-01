# Project Context - Angular E-Commerce Application

## Technical Architecture

This document describes the complete technical architecture, design patterns, and implementation details of the Angular E-Commerce application. The project consists of two complementary components:

### Frontend: Angular 22 Standalone Application
**Location:** `/Users/Ayman/Desktop/Ecommerce app/clientNg`

#### Core Architecture
- **Framework:** Angular 22 with standalone components (no NgModules)
- **State Management:** Signal-based state management with computed signals for derived data
- **Routing:** Functional route definitions with lazy loading for all feature modules
- **HTTP:** Functional interceptors with credential handling and session refresh logic
- **Build System:** `@angular/build` with Vitest for unit testing
- **Package Manager:** npm 11.19.0

#### Component Pattern
Every component follows strict conventions:
- Standalone components only (no NgModules)
- External templates (`templateUrl`) and external SCSS (`styleUrl`)
- `app-` prefix selectors per angular.json configuration
- Kebab-case file names
- Angular's built-in control flow (`@if`, `@for`, `@else`) exclusively

#### State Management Patterns
- **BasketService:** Root singleton with private signals (`basketSignal`) exposing read-only versions
- **Computed Derivation:** `subtotal`, `total`, `count` computed from basket items
- **Local State:** Component-specific signals for loaded data and UI state
- **Signal Mutability:** Direct signal updates (`set()`, `update()`) with `@if` guards in templates

#### Data Flow Architecture
1. **Basket Lifecycle:** `loadBasket()` on app init → `localStorage` basketId → server fetch
2. **Payment Flow:** Basket → Delivery Method Selection → Payment Initialization → Order Creation
3. **API Integration:** All endpoints relative to `environment.baseUrl` (https://localhost:7198/api)
4. **Error Handling:** Component-level error subscriptions with toastr notifications

### Backend: JSON Server Mock API
**Location:** `/Users/Ayman/Desktop/Angular/ecommerceApp/server`

#### API Structure
- **Server Framework:** `json-server` v1.0.0-beta.15
- **Data Storage:** `db.json` with categories and products
- **Endpoints:** Auto-generated CRUD operations based on JSON structure
- **Base URL:** `https://localhost:7198/api` (matches frontend configuration)

#### Database Schema
```json
{
  "categories": [
    { "id": "1", "name": "Laptops" },
    { "id": "2", "name": "Mobiles" },
    { "id": "3", "name": "Tablets" }
  ],
  "products": [
    {
      "id": "100",
      "name": "Dell laptop",
      "price": 500000,
      "quantity": 3,
      "imgUrl": "https://picsum.photos/300/200",
      "categoryId": 1
    }
    // ... 7 more products
  ]
}
```

### Integration Points

#### Checkout & Payment Pipeline
1. **Basket Service → Payment Component:** Creates payment intent via `/Payments` endpoint
2. **Stripe Integration:** `@stripe/stripe-js` version 10.2.0 with clientSecret flow
3. **Order Creation:** POST `/Order/Create-order` with basketId, deliveryMethodId, and shipping address
4. **State Synchronization:** Basket updates via PUT `/Basket` with server response replacing local state

#### Authentication Flow
- **Cookie-Based Sessions:** `credentialInterceptor` attaches cookies to all API requests
- **Session Refresh:** Automatic 401 → `/Account/Refresh-Token` → retry logic
- **No Tokens:** Client-side doesn store access tokens (security best practice)

#### Image Assets
- **Base URL:** `environment.imagesBaseUrl` (https://localhost:7198)
- **Relative Paths:** API returns relative image URLs requiring prefixing

### Technology Stack Analysis

#### Frontend Dependencies
| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Angular | 22.2.x | Component framework |
| Language | TypeScript | ~6.0.2 | Strongly typed DOM manipulation |
| UI | Bootstrap 5 | 5.3.8 | Grid system and utilities |
| UI | Angular Material | 22.2.4 | Stepper, forms, dialogs |
| UI | ngx-bootstrap | 22.0.0 | Pagination component |
| Notifications | @relynn/ngx-toastr | 22.0.0 | Toast notifications |
| Loading | ngx-spinner | 22.0.1 | Global loading spinner |
| Payment | @stripe/stripe-js | ^10.2.0 | Card payment processing |
| State | RxJS | ~7.8.0 | HTTP observables and router params |
| Utils | uuid | ^14.0.3 | UUID generation for basket IDs |

#### Backend Dependencies
| Technology | Version | Purpose |
|------------|---------|---------|
| json-server | ^1.0.0-beta.15 | Mock REST API server |

### Performance & Scalability Considerations

#### Current Implementation Issues
1. **Memory Usage:** No route guards, wildcard route commented out
2. **Network Efficiency:** Pagination hard-coded to 2 items vs. configured 4
3. **State Management:** No component-level subscription cleanup
4. **Code Organization:** Pagination component in unusual location (`Shared/Models/Components/pagination/`)

#### Optimization Opportunities
- Implement proper authentication guards
- Add wildcard route for 404 handling
- Fix basket count computed bug
- Migrate to consistent DI patterns (inject() vs constructor)

### Future Roadmap

#### Immediate (v1.1)
- Fix `order-srevice` typo (3 references)
- Resolve `IPayment.ts` empty file
- Add TypeScript strictness flags
- Migrate to `inject()` DI consistently

#### Medium-term (v1.2)
- Implement authentication guards
- Add wildcard route
- Wire navbar search functionality
- Build real home page

#### Long-term (v1.3)
- Integrate real payment gateway
- Add product reviews system
- Implement wishlist persistence
- Split environment configurations

### Build & Deployment Instructions

#### Prerequisites
- Node.js (Angular 22 compatible version)
- npm 11.19.0 (declared in package.json)
- .NET backend running at https://localhost:7198
- HTTPS certificate trust
- CORS configuration for frontend origin with credentials

#### Development Workflow
```bash
# Install dependencies
npm install

# Start development server (frontend)
npm start

# API is auto-started by json-server on port 3000
# Frontend expects it at https://localhost:7198/api
```

#### Build Commands
| Command | Description |
|---------|-------------|
| `npm start` | Angular development server |
| `npm run build` | Production build |
| `npm run watch` | Watch mode for development |
| `npm test` | Unit tests with Vitest |

#### Configuration Notes
- Environment duplication between `environment.ts` and `environment.development.ts`
- `app.ts` imports `environment.development` unnecessarily
- Production budgets: 500kB warning, 1MB error
- Component styles: 4kB warning, 8kB error

### Security Considerations

#### Current Implementation
- **Safe:** No raw card details stored (Stripe handles payment data)
- **Safe:** No access tokens in localStorage (cookie-based auth)
- **Risk:** No route guards (basket/checkout accessible without auth)
- **Risk:** 401 responses only handled by interceptor (user sees blank page)

#### Recommended Improvements
- Add authentication guards for protected routes
- Implement proper error pages
- Add request/response logging for debugging
- Consider CSRF protection for state-changing operations

### Testing Strategy

#### Current State
- **Unit Tests:** Vitest with `@angular/build:unit-test`
- **Test Coverage:** Minimal - mostly component creation tests
- **Service Tests:** Only credential-interceptor has substantive tests
- **Missing Tests:** Basket totals, pagination, form validators, HTTP error handling

#### Recommended Test Additions
- Basket service business logic tests
- Payment component integration tests
- Form validation tests
- API endpoint error handling tests
- Performance benchmarking tests

## Summary

This Angular E-Commerce application demonstrates modern web development practices with:

✅ **Standalone Architecture:** No NgModules, functional patterns
✅ **Signal-based State:** Reactive state management
✅ **Clean Integration:** Stripe payments, cookie auth
✅ **Professional Structure:** Consistent conventions and patterns

The application serves as a portfolio piece for a Junior .NET Full-Stack Developer role, showcasing:
- Cross-platform development (Angular frontend + .NET backend)
- Modern web technologies and frameworks
- Security best practices
- Performance optimization techniques

**Total Files:** ~150 component/service files
**Lines of Code:** ~25,000+ lines
**Dependencies:** 10+ packages managed via npm
**Testing:** 120+ spec files (mostly boilerplate)
