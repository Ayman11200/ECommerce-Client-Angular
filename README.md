# Fit Plus — Angular Storefront

The customer-facing storefront for Fit Plus, a gym and supplements e-commerce store, built as a standalone Angular 22 application.
It demonstrates signal-based state, lazy-loaded routes, functional HTTP interceptors and a Stripe Elements checkout against a cookie-authenticated ASP.NET Core API.

- Backend repository: [ECommerce-API-DotNet8](https://github.com/Ayman11200/ECommerce-API-DotNet8)

## Table of contents

- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Routes](#routes)
- [API integration](#api-integration)
- [Security](#security)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Known limitations](#known-limitations)
- [Author](#author)

## Screenshots

Add PNG files to `docs/screenshots/` and uncomment the block below.

<!--
![Home](docs/screenshots/home.png)
![Shop](docs/screenshots/shop.png)
![Product details](docs/screenshots/product-details.png)
![Basket](docs/screenshots/basket.png)
![Checkout](docs/screenshots/checkout.png)
![Orders](docs/screenshots/orders.png)
-->

## Tech stack

| Area | Technology | Version |
| --- | --- | --- |
| Framework | Angular (standalone components, signals) | ^22.2.0 |
| UI components | Angular Material / Angular CDK | ^22.2.4 |
| CSS | Bootstrap | ^5.3.8 |
| Language | TypeScript | ~6.0.2 |
| Reactive layer | RxJS | ~7.8.0 |
| Payments | @stripe/stripe-js | ^10.2.0 |
| Spinner | ngx-spinner | ^22.0.1 |
| Notifications | @relynn/ngx-toastr | ^22.0.0 |
| Icons | Bootstrap Icons, Font Awesome, Material Icons | 1.13.2 / 4.7.0 / 1.13.14 |
| Basket ids | uuid | ^14.0.3 |
| Tests | Vitest through `@angular/build:unit-test` | ^5.0.0 |
| Formatting | Prettier | ^3.8.1 |
| Package manager | npm | 11.19.0 |

## Architecture

The application is a single Angular project with feature folders, standalone components and no NgModules.

- **Bootstrap** — `src/main.ts` starts `app.ts` with `app.config.ts`, which registers the router, the HTTP client with functional interceptors, and the toast service.
- **Routing** — `src/app/app.routes.ts` lazy-loads every feature through `loadComponent`; only the home component is imported eagerly.
- **State** — `BasketService` exposes read-only signals and computed values (`basket`, `subtotal`, `total`, `count`, `shipping`); components use local signals for view state.
- **HTTP layer** — `loaderInterceptor` drives the global spinner and `credentialInterceptor` adds credentials and performs a single shared token refresh when an API call returns `401`.
- **Styling** — `angular.json` loads Bootstrap, Font Awesome, Bootstrap Icons, the spinner and toast styles, then `src/styles.scss`; the Angular Material theme and the design tokens in `src/styles/_tokens.scss` are applied from `src/styles.scss`.

```
clientNg/
├── public/
├── src/
│   ├── app/
│   │   ├── About/            # About page
│   │   ├── Basket/           # Basket service and basket page
│   │   ├── BestSeller/       # Best-seller listing
│   │   ├── Core/             # Interceptors, loading service, navigation bar
│   │   ├── Home/             # Landing page
│   │   ├── Identity/         # Register, login, activation, password reset
│   │   ├── Orders/           # Order history, order details, ratings
│   │   ├── Shared/           # Models, directives, footer, order total, pagination
│   │   ├── Shop/             # Product list, filters, product details
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── environments/         # API URLs and Stripe publishable key
│   ├── styles/               # Design tokens and framework overrides
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
└── tsconfig.json
```

## Features

- **Home and about pages** with store information and calls to action.
- **Product browsing** — paged product grid with category filter, sort options, search and reset, plus a product details page with image gallery, discount display and quantity selection.
- **Best sellers** — a dedicated page backed by the API's best-sellers endpoint.
- **Basket** — add, increase, decrease and remove items; quantities and totals are computed from signals; the basket is persisted on the server and its id is kept in `localStorage`.
- **Checkout** — a three-step Angular Material stepper: shipping address (pre-filled from the saved address), delivery method, then Stripe Payment Element.
- **Payment confirmation** — Stripe.js `confirmPayment` with `redirect: 'if_required'`; a dedicated `/checkout/complete` page finishes the order when 3-D Secure redirects the browser.
- **Orders** — order history, order details and product rating submission.
- **Accounts** — registration, email activation, login, forgot password and reset password.
- **Cross-cutting UI** — global request spinner, toast notifications, responsive navigation and footer.

## Routes

| Path | Component | Loading | Notes |
| --- | --- | --- | --- |
| `''` | — | — | Redirects to `/shop`. |
| `home` | `Home` | Eager | Landing page. |
| `shop` | `Shop` | Lazy | Product list, filters and pagination. |
| `product-details/:id` | `ProductDetails` | Lazy | Product details by id. |
| `best-seller` | `BestSeller` | Lazy | Best-selling products. |
| `basket` | `BasketComponent` | Lazy | Basket and totals. |
| `checkout` | `Checkout` | Lazy | Address, delivery and payment stepper. |
| `checkout/complete` | `Complete` | Lazy | Finishes the order after a Stripe redirect. |
| `success` | `SuccessComponent` | Lazy | Order confirmation. |
| `order` | `Order` | Lazy | Order history for the signed-in user. |
| `orderItem/:id` | `OrderItem` | Lazy | Order details and rating form. |
| `login` | `Login` | Lazy | Sign in. |
| `register` | `Register` | Lazy | Sign up. |
| `active` | `ActiveAccount` | Lazy | Email confirmation. |
| `reset-password` | `ResetPassword` | Lazy | Password reset form. |
| `about` | `About` | Lazy | About the store. |
| `**` | — | — | Redirects to `/home`. |

The router has no route guards; pages that require a signed-in user rely on the API returning `401` and on the interceptor's refresh attempt.

## API integration

All requests target `environment.baseUrl` (`https://localhost:7198/api` by default).

| Method | Endpoint | Used by | Purpose |
| --- | --- | --- | --- |
| GET | `/Product` | `ShopService` | Paged products with `pageNumber`, `pageSize`, `categoryId`, `sort`, `search`. |
| GET | `/Product/{id}` | `ShopService` | Product details. |
| GET | `/Product/best-sellers?take=` | `ShopService` | Best sellers. |
| GET | `/Category/get-all` | `ShopService` | Category filter list. |
| GET | `/Basket/{id}` | `BasketService` | Load the basket from Redis. |
| PUT | `/Basket` | `BasketService` | Create or update the basket. |
| DELETE | `/Basket/{id}` | `BasketService` | Delete the basket after an order. |
| POST | `/Payments?basketId=&deliveryMethodId=` | `BasketService` | Create or update the PaymentIntent and return the client secret. |
| GET | `/Order/Get-delivery` | `CheckoutService` | Delivery methods and prices. |
| POST | `/Order/Create-order` | `CheckoutService` | Create the order after payment. |
| GET | `/Order/Get-Orders-for-User` | `OrderSrevice` | Order history. |
| GET | `/Order/Get-order-by-id/{id}` | `OrderSrevice` | Order details. |
| POST | `/Ratings/add-rating` | `OrderSrevice` | Submit a product rating. |
| POST | `/Account/Register` | `IdentityService` | Create an account. |
| POST | `/Account/Login` | `IdentityService` | Sign in and receive the auth cookies. |
| POST | `/Account/Active-Account` | `IdentityService` | Confirm an email address. |
| POST | `/Account/Send-email-forget-password?email=` | `IdentityService` | Request a reset link. |
| POST | `/Account/Reset-password` | `IdentityService` | Reset the password. |
| GET | `/Account/get-address-for-user` | `CheckoutService` | Load the saved shipping address. |
| PUT | `/Account/update-address` | `CheckoutService` | Save the shipping address. |
| POST | `/Account/Refresh-Token` | `credentialInterceptor` | Exchange the refresh cookie for a new access cookie. |

## Security

- **No secrets in the client.** The only Stripe value in the source is the publishable key, which is public by design; the secret key exists only in the API's user secrets.
- **HttpOnly cookies.** The API writes the access and refresh tokens as `HttpOnly` cookies, so the application never reads or stores them in JavaScript.
- **Credentialed requests.** `credentialInterceptor` adds `withCredentials` to requests that target the API base URL only, avoiding credentials on third-party requests.
- **Single refresh.** Concurrent `401` responses share one `/Account/Refresh-Token` request, and the original request is retried once.
- **Redirect-based card confirmation.** Card data is entered inside a Stripe iframe and confirmed with `stripe.confirmPayment`; it never reaches this application's code or the API.

## Prerequisites

| Requirement | Details |
| --- | --- |
| Node.js | `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0` (Angular 22 engine requirement). |
| npm | 8 or newer; the project declares `npm@11.19.0`. |
| Backend API | Running at `https://localhost:7198` with a trusted development certificate (`dotnet dev-certs https --trust`). |
| Stripe | A test-mode account whose publishable key matches the API's secret key. |

## Getting started

Start the backend first, then run the client from the `clientNg` folder.

```bash
npm install
npm start
```

The dev server listens on `http://localhost:4200`, which is the only origin allowed by the API's CORS policy.

Available scripts:

| Command | Description |
| --- | --- |
| `npm start` | `ng serve` — development server on port 4200. |
| `npm run build` | Production build in `dist/`. |
| `npm run watch` | Development build in watch mode. |
| `npm test` | Unit tests through the Angular unit-test builder (Vitest). |
| `npm run ng` | Pass-through to the Angular CLI. |

## Configuration

`src/environments/environment.ts` contains:

| Key | Purpose |
| --- | --- |
| `baseUrl` | API base URL, `https://localhost:7198/api`. |
| `imagesBaseUrl` | Origin used to resolve product image paths, `https://localhost:7198`. |
| `stripePublishableKey` | Stripe publishable key used by `loadStripe`. |

`environment.development.ts` mirrors the same values. `angular.json` defines no file replacements, so the build always consumes `environment.ts`; update both files when the URLs or the publishable key change.

## Known limitations

- **No route guards.** Authenticated pages are protected by API responses, not by `canActivate`/`canMatch`.
- **Test coverage is mostly scaffolding.** Of 30 spec files, only `credential-interceptor.spec.ts` asserts real behaviour; the rest are generated "should create" checks, and three of them (`basket.spec.ts`, `stepper.spec.ts`, `success.spec.ts`) still import class names that no longer exist (`Basket`, `Stepper`, `Success`).
- **Hard-coded page size.** `ShopService` always sends `pageSize=2`, independently of the API's default and maximum.
- **Search exists only on the shop page.** The navbar search form has no handler; `Shop` implements search, category filtering, sorting and reset.
- **Development logging.** `console.log` calls remain in five files (`BasketService`, `Address`, `Order`, `OrderItem` and `ProductDetails`).
- **Empty image alt text.** Product images use `alt=""`, so screen readers get no description.
- **Redirect recovery depends on memory.** The 3-D Secure return page reads the checkout forms from `window`, so a full page reload during the redirect loses them.
- **No sign-out in the UI.** The API exposes `/api/Account/Logout`, but the client has no call to it.
- **No container setup.** There is no Dockerfile or compose file.

## Author

**Ayman**

GitHub: [https://github.com/Ayman11200](https://github.com/Ayman11200)
