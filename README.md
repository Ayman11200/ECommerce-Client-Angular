# E-Commerce Client (Angular)

An Angular storefront that consumes a separate ASP.NET Core Web API. This repository contains the client application only: product browsing, basket management, checkout, order history, product ratings, and account flows such as registration, login, activation, and password reset.

The project is presented as a portfolio piece for a **Junior .NET Full-Stack Developer** role. It demonstrates standalone Angular components, lazy loading, functional HTTP interceptors, signal-based state, reactive forms, Angular Material, Bootstrap, and integration with a cookie-authenticated .NET backend.

> The backend API is not part of this repository. The client expects it to run at `https://localhost:7198`.

## Table of contents

- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Features](#features)
- [Architecture and folder structure](#architecture-and-folder-structure)
- [API integration](#api-integration)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Build and test commands](#build-and-test-commands)
- [Configuration notes](#configuration-notes)
- [Known limitations and roadmap](#known-limitations-and-roadmap)
- [Author](#author)
- [License](#license)

## Screenshots

Screenshots are not committed to the repository yet. Add your own captures at the suggested paths below; no images are fabricated in this README.

| View | Placeholder path |
| --- | --- |
| Storefront / shop grid | `docs/screenshots/shop.png` |
| Product details | `docs/screenshots/product-details.png` |
| Basket | `docs/screenshots/basket.png` |
| Checkout stepper | `docs/screenshots/checkout.png` |
| Order details and rating modal | `docs/screenshots/order-details.png` |
| Login / registration | `docs/screenshots/login.png` |

## Tech stack

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | Angular | 22.2.x |
| Language | TypeScript | ~6.0.2 |
| Reactive programming | RxJS | ~7.8.0 |
| Build tooling | `@angular/build`, Angular CLI | 22.2.x |
| UI foundation | Bootstrap | 5.3.8 |
| Component library | Angular Material / Angular CDK | 22.2.4 |
| Bootstrap components | ngx-bootstrap | 22.0.0 |
| Loading indicator | ngx-spinner | 22.0.1 |
| Notifications | `@relynn/ngx-toastr` | 22.0.0 |
| Icons | Bootstrap Icons, Font Awesome, Material Icons | 1.13.2 / 4.7.0 / 1.13.14 |
| IDs | `uuid` | 14.0.3 |
| Unit tests | Vitest via `@angular/build:unit-test` | 5.0.0 |
| Package manager | npm | 11.19.0 (declared in `package.json`) |

## Features

### Storefront

- Product listing with server-side pagination, category filtering, search, and sorting by name or price.
- Product cards with image thumbnails and an add-to-cart action.
- Product details page with a thumbnail gallery, hover image zoom directive, old/new price display, and discount percentage calculation.
- Quantity selection limited to 1-10 items before adding to the basket.
- Toast notifications for cart and account actions.

### Basket

- Server-persisted basket associated with a basket ID stored in `localStorage`.
- Signal-based basket state with computed subtotal, shipping, and total.
- Increase quantity, decrease quantity, and remove item actions.
- Empty-basket state and a "Proceed to checkout" link.
- Basket is reloaded on application startup.

### Checkout

- Angular Material stepper with shipping address, delivery method, and order confirmation steps.
- Shipping address loaded from and saved to the backend, with an edit/cancel flow.
- Delivery methods loaded from the API; selecting one updates the basket shipping price and order total.
- Order creation from the basket ID, selected delivery method, and shipping address.
- Success page showing confirmation and a link to the created order.

### Orders and ratings

- Order history page listing order number, preview image, date, status, and total.
- Image modal for previewing all items in an order.
- Order details page with product rows, subtotal, shipping, status, and total.
- Product rating modal with 1-5 stars and a comment, submitted from an order's product list.

### Identity

- Registration with username, display name, email, and password validation.
- Login with cookie-based session handling and toast feedback.
- Account activation via email/token query parameters.
- Forgot-password email request from the login page.
- Password reset flow using email/token query parameters and password confirmation validation.

### Cross-cutting UX

- Global loading spinner driven by an HTTP interceptor with request counting.
- Cookie credential interceptor that attaches credentials to API requests and retries a request once after refreshing the session on HTTP 401.
- Responsive Bootstrap navbar with a Material badge for basket item count.
- Toast notifications configured globally with duplicate prevention.
- Lazy-loaded feature routes.

## Architecture and folder structure

The application uses Angular standalone components (no `NgModules` at the feature level), functional route definitions, functional HTTP interceptors, and signal-based service state. `app.config.ts` registers the router, HTTP client with interceptors, and toast notifications. `app.ts` loads the basket on startup and hosts the navbar, router outlet, and global spinner.

```text
src/
├── app/
│   ├── Core/
│   │   ├── Interceptors/
│   │   │   ├── credential-interceptor.ts
│   │   │   └── loader-interceptor.ts
│   │   ├── Services/
│   │   │   └── loading-service.ts
│   │   └── nav-bar-component/
│   ├── Shared/
│   │   ├── Components/
│   │   │   └── order-total/
│   │   ├── Directives/
│   │   │   └── image-zoom.ts
│   │   └── Models/
│   │       ├── Components/
│   │       │   └── pagination/
│   │       ├── IActiveAccount.ts
│   │       ├── IBasket.ts
│   │       ├── ICategory.ts
│   │       ├── IDeliveryMethod.ts
│   │       ├── IOrder.ts
│   │       ├── IPagination.ts
│   │       ├── IProduct.ts
│   │       ├── IRating.ts
│   │       ├── IResetPassword.ts
│   │       └── ProductParams.ts
│   ├── Shop/
│   │   ├── product-details/
│   │   ├── shop-item/
│   │   ├── shop-service.ts
│   │   └── shop.ts
│   ├── Basket/
│   │   ├── basket/
│   │   └── basket-service.ts
│   ├── checkout/
│   │   ├── address/
│   │   ├── delivery/
│   │   ├── payment/
│   │   ├── stepper/
│   │   ├── success/
│   │   ├── checkout-service.ts
│   │   └── checkout.ts
│   ├── Orders/
│   │   ├── order/
│   │   ├── order-item/
│   │   └── order-srevice.ts
│   ├── Identity/
│   │   ├── active-account/
│   │   ├── login/
│   │   ├── register/
│   │   ├── reset-password/
│   │   └── identity-service.ts
│   ├── Home/
│   │   └── home.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.ts
│   ├── app.html
│   └── app.scss
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
├── index.html
├── main.ts
└── styles.scss
```

### Folder responsibilities

- **Core** - application-wide concerns: the navbar, global loading service, and HTTP interceptors.
- **Shared** - reusable models, the order-total component, the pagination component, and the image zoom directive.
- **Shop** - product listing, product cards, product details, and the shop API service.
- **Basket** - basket state/service and the basket page.
- **checkout** - the Material stepper, address, delivery, payment/confirmation, success page, and checkout API service.
- **Orders** - order history, order details, rating submission, and the order API service.
- **Identity** - registration, login, account activation, password reset, and the identity API service.
- **Home** - a route placeholder for a future landing page.

### Routing

Routes are defined in `src/app/app.routes.ts`. The default path redirects to `shop`. The home route is eager; the remaining feature routes are lazy-loaded with `loadComponent`.

| Path | Component | Loading |
| --- | --- | --- |
| `''` | Redirect to `/shop` | - |
| `home` | `Home` | Eager |
| `shop` | `Shop` | Lazy |
| `basket` | `BasketComponent` | Lazy |
| `register` | `Register` | Lazy |
| `active` | `ActiveAccount` | Lazy |
| `login` | `Login` | Lazy |
| `reset-password` | `ResetPassword` | Lazy |
| `checkout` | `Checkout` | Lazy |
| `success` | `SuccessComponent` | Lazy |
| `order` | `Order` | Lazy |
| `orderItem/:id` | `OrderItem` | Lazy |
| `product-details/:id` | `ProductDetails` | Lazy |

There are no route guards and no active wildcard route; see [Known limitations and roadmap](#known-limitations-and-roadmap).

### State management

- `BasketService` exposes a readonly signal for the basket and computed values for subtotal, shipping, and total.
- Feature components use local signals for loaded data and loading flags.
- The basket ID is persisted in `localStorage`; authentication itself is cookie-based and does not store tokens in browser storage.

## API integration

### Base URL configuration

API settings live in `src/environments/environment.ts` and `src/environments/environment.development.ts`:

```ts
export const environment = {
  baseUrl: 'https://localhost:7198/api',
  imagesBaseUrl: 'https://localhost:7198',
};
```

- `baseUrl` is the API root and already includes `/api`.
- `imagesBaseUrl` is prefixed to relative image names returned by the API.
- Both environment files currently contain identical values.

### Authentication and session handling

- `credentialInterceptor` clones every request whose URL starts with `environment.baseUrl` and adds `withCredentials: true`, so the backend's cookies are sent.
- The client does not store access tokens in `localStorage` or `sessionStorage`.
- On a `401` response from an API request, the interceptor calls `POST /Account/Refresh-Token` with credentials. Concurrent failures share a single in-flight refresh request, and the original request is retried once.
- Requests to the refresh endpoint itself are excluded from the retry logic to avoid loops.
- The backend must therefore allow the Angular origin with credentials (CORS cannot use a wildcard origin in this setup).

### Endpoint reference

All paths are relative to `https://localhost:7198/api`.

| Method | Path | Purpose | Source |
| --- | --- | --- | --- |
| GET | `/Product` | Paginated product list; accepts `categoryId`, `sort`, `search`, `pageNumber`, `pageSize` | `src/app/Shop/shop-service.ts` |
| GET | `/Category/get-all` | All product categories | `src/app/Shop/shop-service.ts` |
| GET | `/Product/{id}` | Single product details | `src/app/Shop/shop-service.ts` |
| GET | `/Basket/{id}` | Load a basket by ID | `src/app/Basket/basket-service.ts` |
| PUT | `/Basket` | Create or update a basket | `src/app/Basket/basket-service.ts` |
| DELETE | `/Basket/{id}` | Delete an empty basket | `src/app/Basket/basket-service.ts` |
| PUT | `/Account/update-address` | Save the current user's shipping address | `src/app/checkout/checkout-service.ts` |
| GET | `/Account/get-address-for-user` | Load the current user's shipping address | `src/app/checkout/checkout-service.ts` |
| GET | `/Order/Get-delivery` | Available delivery methods | `src/app/checkout/checkout-service.ts` |
| POST | `/Order/Create-order` | Create an order from the basket | `src/app/checkout/checkout-service.ts` |
| GET | `/Order/Get-Orders-for-User` | Order history for the current user | `src/app/Orders/order-srevice.ts` |
| GET | `/Order/Get-order-by-id/{id}` | Single order details | `src/app/Orders/order-srevice.ts` |
| POST | `/Ratings/add-rating` | Submit a product rating and comment | `src/app/Orders/order-srevice.ts` |
| POST | `/Account/Register` | Register a new account | `src/app/Identity/identity-service.ts` |
| POST | `/Account/Login` | Log in and establish the cookie session | `src/app/Identity/identity-service.ts` |
| POST | `/Account/Active-Account` | Activate an account with email and token | `src/app/Identity/identity-service.ts` |
| POST | `/Account/Send-email-forget-password` | Request a password-reset email (`email` query parameter) | `src/app/Identity/identity-service.ts` |
| POST | `/Account/Reset-password` | Reset the password with email, token, and new password | `src/app/Identity/identity-service.ts` |
| POST | `/Account/Refresh-Token` | Refresh the session cookie after a 401 | `src/app/Core/Interceptors/credential-interceptor.ts` |

The order API service file is named `order-srevice.ts` in the repository; the table preserves the filename as-is.

## Prerequisites

- **Node.js** - a version supported by Angular 22.
- **npm** - 11.19.0 is declared as the package manager in `package.json`.
- **.NET backend** - running locally at `https://localhost:7198`, exposing the API under `/api`.
- **HTTPS trust** - the browser must trust the ASP.NET Core development certificate because the API uses HTTPS.
- **CORS** - the backend must allow requests from `http://localhost:4200` and permit credentials.
- Angular CLI is optional; the project scripts use the locally installed CLI.

## Getting started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd clientNg
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the .NET API and confirm it is reachable at `https://localhost:7198/api`.

4. Review the environment files if your backend runs elsewhere:

   ```text
   src/environments/environment.ts
   src/environments/environment.development.ts
   ```

5. Start the development server:

   ```bash
   npm start
   ```

6. Open `http://localhost:4200` in the browser. The application redirects the root path to `/shop`.

## Build and test commands

| Command | Description |
| --- | --- |
| `npm start` | Start the Angular development server (`ng serve`) |
| `npm run build` | Create a production build (`ng build`) |
| `npm run watch` | Development build in watch mode |
| `npm test` | Run unit tests with Vitest via `@angular/build:unit-test` |

Production builds enforce the budgets configured in `angular.json`:

- Initial bundle: warning at 500 kB, error at 1 MB.
- Component styles: warning at 4 kB, error at 8 kB.

No end-to-end test framework is configured in this repository.

## Configuration notes

- **Environment duplication** - `environment.ts` and `environment.development.ts` are currently identical, and `angular.json` does not define file replacements. This should be split into real environment-specific values if the project is deployed.
- **Direct development import** - `src/app/app.ts` imports `environment.development` directly, while the services import `environment.ts`. This is another reason to standardize environment selection.
- **Fixed page size** - `ShopService.getAllProducts` always sends `pageSize=2`, even though `ProductParams` defaults to 4. The effective page size is therefore controlled by the service.
- **Asset URLs** - image paths returned by the API are relative and must be prefixed with `imagesBaseUrl`.
- **API path** - `baseUrl` already ends with `/api`; do not repeat `/api` in individual endpoint paths.

## Known limitations and roadmap

- **No route guards or role-based UI** - protected screens rely on the backend returning `401`; there is no client-side authorization.
- **No wildcard/404 route** - the wildcard route is commented out in `app.routes.ts`, so unknown paths render an empty outlet.
- **Navbar links without routes** - the navbar includes "About us" and "Best Seller" links, but no matching routes exist. The navbar search form is also not wired to the shop search.
- **Home page is a placeholder** - the `home` route renders a stub component rather than a real landing page.
- **No admin/product management UI** - products, categories, and delivery methods are read-only from the client.
- **Wishlist is not implemented** - the wishlist link/button on the product pages is presentational only.
- **Similar products are static** - the product details page contains hard-coded demo content, not API-driven recommendations.
- **No online payment gateway** - the checkout "Payment" step submits the order directly to the backend; no card processor is integrated.
- **Ratings are submitted from order details only** - there is no public review list on the product details page.
- **Basket is anonymous** - the basket is identified by a `localStorage` ID and is not merged into the user account after login.
- **Test coverage is minimal** - spec files are scaffolded, but there is no comprehensive unit or end-to-end suite.
- **Environment configuration is not production-ready** - both environment files point to the local HTTPS backend and are duplicated.

Suggested next steps: add authentication guards and a wildcard route, wire the navbar search, build a real home page, add product reviews and wishlist persistence, integrate a payment provider, and split development/production environments.

## Author

**Your Name** - Junior .NET Full-Stack Developer

- GitHub: `https://github.com/your-username`
- LinkedIn: `https://linkedin.com/in/your-profile`
- Email: `you@example.com`

Replace these placeholders with your own details before publishing the repository.

## License

No license is currently specified for this repository. Add a `LICENSE` file if you intend to publish the project; for example, the MIT License is a common choice for portfolio projects.
