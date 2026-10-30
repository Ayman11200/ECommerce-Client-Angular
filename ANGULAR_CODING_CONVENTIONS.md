# Angular Coding Conventions

This document describes the coding style that is **actually used** in this repository. It is descriptive, not prescriptive: every pattern below was observed in the source. File references use the `path:line` notation so they can be jumped to directly.

## Table of Contents

1. [Toolchain and Project Setup](#toolchain-and-project-setup)
2. [Project Structure and Naming](#project-structure-and-naming)
3. [Component Conventions](#component-conventions)
4. [State Management](#state-management)
5. [Services and HTTP](#services-and-http)
6. [Interceptors, Loading and Notifications](#interceptors-loading-and-notifications)
7. [Models and Interfaces](#models-and-interfaces)
8. [Templates](#templates)
9. [Forms](#forms)
10. [Styling](#styling)
11. [Routing](#routing)
12. [Testing](#testing)
13. [Conventions Consistently Followed](#conventions-consistently-followed)
14. [Areas for Improvement](#areas-for-improvement)

---

## Toolchain and Project Setup

The application is an Angular 22 standalone application built with `@angular/build` and tested with Vitest. There is **no ESLint configuration** in the repository (no `eslint.config.js`, `.eslintrc.json`, or `.eslintrc.js`, and no `lint` npm script).

`package.json`:

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  },
  "dependencies": {
    "@angular/cdk": "^22.2.4",
    "@angular/common": "^22.2.0",
    "@angular/compiler": "^22.2.0",
    "@angular/core": "^22.2.0",
    "@angular/forms": "^22.2.0",
    "@angular/material": "^22.2.4",
    "@relynn/ngx-toastr": "^22.0.0",
    "bootstrap": "^5.3.8",
    "ngx-bootstrap": "^22.0.0",
    "ngx-spinner": "^22.0.1",
    "rxjs": "~7.8.0",
    "uuid": "^14.0.3"
  },
  "devDependencies": {
    "@angular/build": "^22.2.0",
    "@angular/cli": "^22.2.0",
    "prettier": "^3.8.1",
    "typescript": "~6.0.2",
    "vitest": "^5.0.0"
  }
}
```

Source: `package.json:4-43`

Formatting is delegated to Prettier with a 100-character print width and single quotes:

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ]
}
```

Source: `.prettierrc:1-12`

The EditorConfig enforces two-space indentation, UTF-8, final newlines and single quotes for TypeScript (`.editorconfig:4-13`). TypeScript is configured with several strictness flags, although `strict` itself is not set:

```json
"noImplicitOverride": true,
"noPropertyAccessFromIndexSignature": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true,
"skipLibCheck": true,
"isolatedModules": true,
```

Source: `tsconfig.json:6-11`

The test tsconfig globally provides Vitest types (`tsconfig.spec.json:5-8`), and the build tsconfig excludes spec files (`tsconfig.app.json:8-9`).

---

## Project Structure and Naming

Top-level feature folders are a mix of PascalCase and lowercase:

- `src/app/Core` (capitalized) contains `Interceptors`, `Services`, and `nav-bar-component`.
- `src/app/Shared` contains `Models`, `Directives`, and `Components`.
- `src/app/Shop` and `src/app/Basket` are capitalized.
- `src/app/checkout` and `src/app/Identity` and `src/app/Orders` and `src/app/Home` do not follow a single case convention.

Files use **kebab-case**, including multi-word component files:

- `src/app/Core/nav-bar-component/nav-bar-component.ts`
- `src/app/Shop/shop-item/shop-item.ts`
- `src/app/Shop/product-details/product-details.ts`
- `src/app/Identity/active-account/active-account.ts`
- `src/app/Shared/Components/order-total/order-total.ts`

One file name contains a typo that is propagated to the class name and spec: `order-srevice` instead of `order-service`.

```ts
@Injectable({
  providedIn: 'root',
})
export class OrderSrevice {
  private httpClient = inject(HttpClient);

  getOrdersForUser() {
    return this.httpClient.get<IOrder[]>(`${environment.baseUrl}/Order/Get-Orders-for-User`);
  }
```

Source: `src/app/Orders/order-srevice.ts:7-14`

Class naming is PascalCase. Most classes drop the `Component` suffix (`Shop`, `ShopItem`, `ProductDetails`, `Order`, `Login`), but a few keep it or retain schematic names (`BasketComponent`, `SuccessComponent`, `NavBarComponent`, `StepperOverviewExample`). Selectors are lowercase kebab-case with the `app` prefix configured in `angular.json:18`.

```ts
@Component({
  imports: [ShopItem, FormsModule, PaginationModule, Pagination],
  selector: 'app-shop',
  styleUrl: './shop.scss',
  templateUrl: './shop.html',
})
export class Shop implements OnInit {
```

Source: `src/app/Shop/shop.ts:12-18`

All components use external templates and external SCSS through `templateUrl` and `styleUrl`; no inline `template:` or `styles:` were found.

A Shared component lives in an unusual place: the pagination component is under `src/app/Shared/Models/Components/pagination/`, not `Shared/Components`.

---

## Component Conventions

### Standalone components

Every component is standalone (Angular 22 default). Only three files still declare `standalone: true` explicitly:

```ts
@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, OrderTotal],
  templateUrl: './basket.html',
  styleUrl: './basket.scss',
})
export class BasketComponent {
```

Source: `src/app/Basket/basket/basket.ts:9-16`

The explicit property is also present in `src/app/checkout/address/address.ts:12` and `src/app/Identity/reset-password/reset-password.ts:19`. All other components omit it.

### `imports` arrays

Components import exactly the standalone dependencies they use. Ordering is inconsistent: sometimes grouped, sometimes alphabetical, sometimes not:

```ts
@Component({
  imports: [CurrencyPipe, DecimalPipe, ImageZoom, FormsModule, RouterLink],
  selector: 'app-product-details',
  styleUrl: './product-details.scss',
  templateUrl: './product-details.html',
})
```

Source: `src/app/Shop/product-details/product-details.ts:12-17`

```ts
@Component({
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
  ],
  selector: 'app-address',
  standalone: true,
  templateUrl: './address.html',
  styleUrl: './address.scss',
})
```

Source: `src/app/checkout/address/address.ts:10-23`

An empty `imports: []` is sometimes left in place (`src/app/Home/home.ts:4`, `src/app/Identity/active-account/active-account.ts:9`).

### Dependency injection: constructor vs `inject()`

Both styles are used, often in the same feature.

Constructor injection:

```ts
export class App implements OnInit {
  constructor(private basketService: BasketService) {}

  ngOnInit() {
    this.basketService.loadBasket();
  }
}
```

Source: `src/app/app.ts:18-24`

`inject()`-based injection:

```ts
export class NavBarComponent {
  private elementRef = inject(ElementRef);
  private basketService = inject(BasketService);

  isCollapsed = true;
  visible = false;
```

Source: `src/app/Core/nav-bar-component/nav-bar-component.ts:13-18`

Constructor DI is used by `App`, `Shop`, `ShopItem`, `ProductDetails`, the services `ShopService`, `BasketService`, `LoadingService`, `IdentityService`, and `Login`, `Register`, `ActiveAccount`, `ResetPassword` (`src/app/Identity/login/login.ts:22-27`). `inject()` is used by `NavBarComponent`, `BasketComponent`, `OrderTotal`, `Order`, `OrderItem`, `Delivery`, `Payment`, `Address`, `StepperOverviewExample`, `CheckoutService`, and `OrderSrevice`.

Some files import `Service` from `@angular/core`, which is not a real injectable decorator, alongside `Injectable`:

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
```

Source: `src/app/checkout/checkout-service.ts:1-2` (also `src/app/Identity/identity-service.ts:2`)

### Lifecycle hooks and subscriptions

`OnInit` is the dominant lifecycle hook. Async work is started there and consumed with manual `.subscribe()`:

```ts
export class Order implements OnInit {
  private orderService = inject(OrderSrevice);
  private imageBaseUrl = environment.imagesBaseUrl;

  orders = signal<IOrder[]>([]);
  selectedOrder: IOrder | null = null;

  ngOnInit(): void {
    this.orderService.getOrdersForUser().subscribe({
      next: (val) => {
        console.log(val);
        this.orders.set(val);
      },
      error: (err) => {},
    });
  }
}
```

Source: `src/app/Orders/order/order.ts:15-30`

No component implements `OnDestroy`, and no subscription uses `takeUntilDestroyed`, `takeUntil`, or manual `unsubscribe`. Exceptions that limit subscriptions with `take(1)` are `ActiveAccount` and the one-off `timer`:

```ts
ngOnInit(): void {
  this.activatedRoute.queryParams.pipe(take(1)).subscribe((param) => {
    const email = param['email'];
    const token = param['token'];
```

Source: `src/app/Identity/active-account/active-account.ts:28-31`

### Signals vs RxJS

Signals are the preferred local state primitive:

```ts
products = signal<IProduct[]>([]);
categories = signal<ICategory[]>([]);
totalCount = signal<number>(0);
productParams = new ProductParams();
searchText: string = '';
```

Source: `src/app/Shop/shop.ts:28-32`

RxJS is used for HTTP and for router/query-parameter streams. `toSignal` is imported in two components but is never called (`src/app/Core/nav-bar-component/nav-bar-component.ts:3`, `src/app/Basket/basket/basket.ts:4`). `computed` is imported in `NavBarComponent` but unused (`src/app/Core/nav-bar-component/nav-bar-component.ts:1`).

Both `signal` and plain mutable fields coexist in the same class; `productParams` and `quantity` are plain objects/numbers.

### Inputs and outputs

Decorator-based inputs/outputs dominate:

```ts
export class ShopItem {
  constructor(
    private toastrService: ToastrService,
    private basketService: BasketService,
  ) {}
  @Input() product: IProduct = {} as IProduct;
  selectedPhoto = signal(0);
  imagesBaseUrl = environment.imagesBaseUrl;
```

Source: `src/app/Shop/shop-item/shop-item.ts:16-22`

The modern signal-based `input()` API appears only in the image zoom directive:

```ts
export class ImageZoom {
  zoom = input<number>(2);
  private img: HTMLImageElement = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;
```

Source: `src/app/Shared/Directives/image-zoom.ts:11-13`

`@Output` is used with a manual emitter wrapper rather than `output()`:

```ts
export class Pagination {
  @Input() pageSize: number = 4;
  @Input() totalCount: number = 0;

  @Output() pageChanged = new EventEmitter();
  emit(event: PageChangedEvent) {
    this.pageChanged.emit(event);
  }
}
```

Source: `src/app/Shared/Models/Components/pagination/pagination.ts:10-17`

`EventEmitter` is not parameterized, so it defaults to `any`.

### Change detection

There is **no** `ChangeDetectionStrategy` anywhere in `src/app`. Every component uses the default change detection strategy.

### Host bindings

Host listeners are done with `@HostListener` in the navbar rather than the `host` object:

```ts
@HostListener('document:click', ['$event'])
onDocumentClick(event: Event) {
  if (!this.elementRef.nativeElement.contains(event.target)) {
    this.closeAll();
  }
}
```

Source: `src/app/Core/nav-bar-component/nav-bar-component.ts:33-38`

The directive uses the newer `host` metadata object instead:

```ts
@Directive({
  selector: '[appImageZoom]',
  host: {
    '(pointerenter)': 'zoomIn($event)',
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'zoomOut()',
  },
})
```

Source: `src/app/Shared/Directives/image-zoom.ts:3-10`

---

## State Management

There is no NgRx, signal store, or global app-state service. Shared state is held in root-provided singleton services, and components read those services directly in templates.

### Basket state

`BasketService` keeps private writable signals, exposes read-only signals, and derives totals with `computed`:

```ts
private basketSignal = signal<IBasket | null>(null);
basket = this.basketSignal.asReadonly();

subtotal = computed(
  () => this.basket()?.basketItems.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0,
);
total = computed(() => this.subtotal() + this.shipping());

count = computed(() => this.basket()?.basketItems.reduce((sum, i) => sum + i.quantity, 0)) ?? 0;

private shippingSignal = signal(0);
shipping = this.shippingSignal.asReadonly();
```

Source: `src/app/Basket/basket-service.ts:14-25`

Note the `?? 0` on `count` is outside the `computed(...)` call, so it applies to the computed signal object, not to the reduced value. The signal itself is never null, making the fallback ineffective.

Basket persistence uses `localStorage` for the basket identifier only; the basket body lives on the server:

```ts
private createBasket(): IBasket {
  const basket = new Basket();
  localStorage.setItem('basketId', basket.id);
  return basket;
}
```

Source: `src/app/Basket/basket-service.ts:111-115`

`loadBasket` reads it back:

```ts
loadBasket() {
  const id = localStorage.getItem('basketId');
  if (!id) return;

  this.httpClient.get<IBasket>(`${environment.baseUrl}/Basket/${id}`).subscribe({
    next: (basket) => this.basketSignal.set(basket),
    error: (err) => console.log(err),
  });
}
```

Source: `src/app/Basket/basket-service.ts:32-40`

Updates are optimistic: `copyBasket` clones the current value, mutates the copy, and sends it to the server; the server response replaces the signal.

```ts
private copyBasket(): IBasket | null {
  const current = this.basket();
  if (!current) return null;

  return { ...current, basketItems: current.basketItems.map((i) => ({ ...i })) };
}
```

Source: `src/app/Basket/basket-service.ts:117-122`

The shared service is consumed directly in templates, including calling mutating methods from template event handlers:

```html
@let currentBasket = basketService.basket();

@if (currentBasket && currentBasket.basketItems?.length > 0) {
```

Source: `src/app/Basket/basket/basket.html:1-3`

### User/session state

There is no client-side "current user" signal or observable. `IdentityService.login` returns the server response, and the component only shows a toast and navigates; authenticated sessions rely on the `withCredentials` cookie handled by the interceptor. `BehaviorSubject` is imported in `BasketService` but never used (`src/app/Basket/basket-service.ts:2`) and no `sessionStorage` usage exists.

The basket is loaded once at application start:

```ts
export class App implements OnInit {
  constructor(private basketService: BasketService) {}

  ngOnInit() {
    this.basketService.loadBasket();
  }
}
```

Source: `src/app/app.ts:18-24`

---

## Services and HTTP

Services are root singletons via `providedIn: 'root'` and return `Observable`s from `HttpClient`; components subscribe. There is no shared repository layer and no `map`/`tap` composition in feature services.

```ts
@Injectable({
  providedIn: 'root',
})
export class ShopService {
  constructor(private httpClient: HttpClient) {}

  // Products
  getAllProducts(productParams: ProductParams): Observable<IPagination> {
    let param = new HttpParams();
    if (productParams.categoryId) {
      param = param.append('categoryId', productParams.categoryId.toString());
    }
    if (productParams.sort) {
      param = param.append('sort', productParams.sort);
    }
    if (productParams.search) {
      param = param.append('search', productParams.search);
    }
    param = param.append('pageNumber', productParams.pageNumber);
    param = param.append('pageSize', 2);

    return this.httpClient.get<IPagination>(`${environment.baseUrl}/Product`, { params: param });
  }
```

Source: `src/app/Shop/shop-service.ts:10-32`

Query parameters are built fluently with `HttpParams`. `pageSize` is hard-coded to `2` here, even though `ProductParams.pageSize` defaults to `4` (`src/app/Shared/Models/ProductParams.ts:6`) and the shop template displays it.

Return types are inconsistent. `ShopService` annotates most methods, while `CheckoutService` and `IdentityService` often rely on inference and use `any` for form payloads:

```ts
@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private httpClient = inject(HttpClient);

  updateAddress(form: any) {
    return this.httpClient.put(`${environment.baseUrl}/Account/update-address`, form, {});
  }

  getAddress() {
    return this.httpClient.get(`${environment.baseUrl}/Account/get-address-for-user`);
  }
```

Source: `src/app/checkout/checkout-service.ts:7-19`

```ts
register(form: any) {
  return this.httpClient.post(`${environment.baseUrl}/Account/Register`, form);
}
login(form: any) {
  return this.httpClient.post(`${environment.baseUrl}/Account/Login`, form, {});
}
```

Source: `src/app/Identity/identity-service.ts:13-19`

HTTP error handling is done in each component's `subscribe` callback, usually with `console.log`/`console.error`, and sometimes with toastr. There are no global HTTP error handlers.

Environment values are imported directly from `src/environments/environment.ts` in most files:

```ts
export const environment = {
  baseUrl: 'https://localhost:7198/api',
  imagesBaseUrl: 'https://localhost:7198',
};
```

Source: `src/environments/environment.ts:1-4`

The development environment file is byte-for-byte identical (`src/environments/environment.development.ts:1-4`), and `app.ts` imports the development file even though it does not use the value (`src/app/app.ts:5`).

Error messages are surfaced with `err?.error?.message` where typed loosely:

```ts
error: (err: any) => {
  this.toastr.error(err?.error?.message ?? 'Invalid email or password.', 'LOGIN FAILED');
},
```

Source: `src/app/Identity/login/login.ts:60-62`

---

## Interceptors, Loading and Notifications

Interceptors are functional and registered in `app.config.ts`:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loaderInterceptor,credentialInterceptor])),
    provideToastr({
      timeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
};
```

Source: `src/app/app.config.ts:9-20`

### Loader interceptor

The loader interceptor shows a spinner for every request and hides it in `finalize`:

```ts
export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  
  const loadingService = inject(LoadingService);

  loadingService.show();

  return next(req).pipe(
    finalize(() => {loadingService.hide();}),
  );
};
```

Source: `src/app/Core/Interceptors/loader-interceptor.ts:6-15`

`LoadingService` uses a reference counter so overlapping requests keep the spinner visible:

```ts
export class LoadingService {
  private requestCount: number = 0;

  constructor(private spinner: NgxSpinnerService) {}

  show(): void {
    this.requestCount++;

    if (this.requestCount === 1) {
      this.spinner.show('primary');
    }
  }
```

Source: `src/app/Core/Services/loading-service.ts:7-18`

The spinner itself is declared once in the root template with the `primary` name:

```html
<ngx-spinner
  name="primary"
  type="square-jelly-box"
  size="large"
  bdColor="rgba(0, 0, 0, 0.84)"
  color="#ffffff"
  [fullScreen]="true"
  [zIndex]="99999"
>
  <p style="color: white">Loading...</p>
</ngx-spinner>
```

Source: `src/app/app.html:2-12`

### Credential interceptor

The credential interceptor adds cookies to API requests and refreshes an expired session once, de-duplicating concurrent refreshes through a module-level observable:

```ts
export const credentialInterceptor: HttpInterceptorFn = (req, next) => {
  const refreshHttp = new HttpClient(inject(HttpBackend));
  const isApiRequest = req.url.startsWith(environment.baseUrl);
  const authReq = isApiRequest ? req.clone({ withCredentials: true }) : req;
  const isRefreshRequest = req.url.startsWith(
    `${environment.baseUrl}/Account/Refresh-Token`,
  );

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !isApiRequest || isRefreshRequest) {
        return throwError(() => error);
      }

      if (!refreshRequest$) {
        refreshRequest$ = createRefreshRequest(refreshHttp).pipe(
          finalize(() => {
            refreshRequest$ = null;
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
      }

      return refreshRequest$.pipe(
        switchMap(() => next(authReq)),
        catchError(() => throwError(() => error)),
      );
    }),
  );
};
```

Source: `src/app/Core/Interceptors/credential-interceptor.ts:13-42`

This is the only place in the application that composes observables with `catchError`, `switchMap`, `shareReplay`, and `finalize`.

### Notifications

Toastr is used for user feedback, with title strings sometimes uppercased manually:

```ts
this.toastr.success('You have logged in successfully.', 'SUCCESS');

this.router.navigateByUrl('/');
```

Source: `src/app/Identity/login/login.ts:56-58`

```ts
this.toastr.success(
  'Register success , please confierm your email',
  'success'.toUpperCase(),
);
```

Source: `src/app/Identity/register/register.ts:51-54`

---

## Models and Interfaces

Interfaces live in `src/app/Shared/Models`, are prefixed with `I`, and are plain DTO shapes. There are no optional fields; fields that may be missing at runtime are still declared as required and guarded with optional chaining in templates.

```ts
export interface IProduct {
  id: number;
  name: string;
  description: string;
  newPrice: number;
  oldPrice: number;
  categoryName: string;
  photos: IPhoto[];
}

export interface IPhoto {
  imageName: string;
  productId: number;
}
```

Source: `src/app/Shared/Models/IProduct.ts:1-14`

Related interfaces are grouped in one file, and a class may accompany the interface when a default factory is needed:

```ts
export interface IBasket {
  id: string;
  basketItems: IBasketItem[];
}

export interface IBasketItem {
  productId: number;
  name: string;
  description: string;
  quantity: number;
  image: string;
  price: number;
  categoryName: string;
}

export class Basket implements IBasket {
  id = uuidv4();
  basketItems: IBasketItem[] = [];
}
```

Source: `src/app/Shared/Models/IBasket.ts:3-21`

DTO naming is inconsistent: request shapes use verb-like names (`ICreateOrder`), and nested DTOs use a `Dto` suffix (`shippingAddressDto`):

```ts
export interface ICreateOrder {
  basketId: string;
  deliveryMethodId: number;
  shippingAddressDto: IShippingAddress;
}
export interface IShippingAddress {
  firstName: string;
  lastName: string;
  city: string;
  zipCode: string;
  street: string;
  state: string;
}
```

Source: `src/app/Shared/Models/IOrder.ts:1-13`

`ProductParams` is a class without the `I` prefix and is used as a mutable parameter object:

```ts
export class ProductParams {
  categoryId: number = 0;
  sort: string = 'Name';
  search: string = '';
  pageNumber: number = 1;
  pageSize: number = 4;
}
```

Source: `src/app/Shared/Models/ProductParams.ts:1-7`

Pagination is modeled as a concrete product array, not a generic:

```ts
export interface IPagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  data: IProduct[];
}
```

Source: `src/app/Shared/Models/IPagination.ts:3-8`

Type assertions are used to bootstrap empty signal values, for example `signal<IOrder>({} as IOrder)` (`src/app/Orders/order-item/order-item.ts:23`) and `@Input() product: IProduct = {} as IProduct` (`src/app/Shop/shop-item/shop-item.ts:20`).

---

## Templates

### Control flow

The project uses Angular's built-in control flow (`@if`, `@for`, `@else`) exclusively. No `*ngIf` or `*ngFor` directives appear anywhere.

```html
@for (item of SortingOption; track $index) {
  <option [value]="item.value">{{ item.name }}</option>
}
```

Source: `src/app/Shop/shop.html:20-22`

```html
@for (product of products(); track $index) {
  <app-shop-item [product]="product" class="product-item col-lg-4 col-md-6"></app-shop-item>
}
```

Source: `src/app/Shop/shop.html:64-66`

Tracking uses `$index` in most lists, and entity ids where available (`track category.id`, `track item.productId`, `track order.id`). The `@let` syntax is used in the basket template:

```html
@let currentBasket = basketService.basket();

@if (currentBasket && currentBasket.basketItems?.length > 0) {
```

Source: `src/app/Basket/basket/basket.html:1-3`

`@else` branches are used for empty/error states, for example `product-details.html:164-166` and `basket.html:71-75`.

### Pipes and async

Pipes are heavily used (`currency`, `date`, `number`) and imported into the component's `imports` array. The `async` pipe is **not used anywhere**; observables are converted to signals in TS or subscribed manually.

```ts
import { CurrencyPipe, DecimalPipe } from '@angular/common';
```

Source: `src/app/Shop/product-details/product-details.ts:6`

```html
<span class="old-price-discount text-danger">
  ({{ getDiscount() | number: '1.0-0' }}% off)
</span>
```

Source: `src/app/Shop/product-details/product-details.html:46-48`

### Event and property binding

Event binding is used directly, including inline assignment in the template:

```html
<button
  type="button"
  class="image-button"
  (click)="selectedOrder = order"
  data-bs-toggle="modal"
  data-bs-target="#ImageModal"
```

Source: `src/app/Orders/order/order.html:30-35`

Dynamic classes use `[class.x]`:

```html
<img
  class="w-100 thumb"
  [class.active]="photo.imageName == selectedImage()"
  [src]="imagesBaseUrl + photo.imageName"
  (click)="selectedImage.set(photo.imageName)"
  alt="Product thumbnail"
/>
```

Source: `src/app/Shop/product-details/product-details.html:20-26`

Attribute interpolation uses `[attr.*]` for ARIA attributes:

```html
<button
  type="button"
  class="navbar-toggler"
  (click)="toggleMenu()"
  [attr.aria-expanded]="!isCollapsed"
  aria-label="Toggle navigation"
>
```

Source: `src/app/Core/nav-bar-component/nav-bar-component.html:8-14`

### UI libraries

- **Bootstrap 5** provides the grid and utilities (`container`, `row`, `col-md-*`, `d-flex`, `justify-content-between`, `table`, `btn`, `modal`). Its CSS is listed globally in `angular.json:33`.
- **Angular Material** is used in checkout: `mat-stepper`, `mat-form-field`, `matInput`, `mat-radio-group`, `mat-icon`, `mat-stroked-button`.
- **ngx-bootstrap** supplies the pagination component and the `PageChangedEvent` type.
- **ngx-spinner** supplies the global loader.
- **Toastr** (`@relynn/ngx-toastr`) supplies transient notifications.
- **Bootstrap JS** is used directly for modals (`import { Modal } from 'bootstrap'` at `src/app/Orders/order-item/order-item.ts:10`, and `import 'bootstrap'` at `src/app/Orders/order/order.ts:7`).
- **Font Awesome** and **Bootstrap Icons** are both used, often in the same project, with icons named `fa fa-*` and `bi bi-*`.

Material form usage:

```html
<mat-form-field appearance="outline">
  <mat-label>First Name</mat-label>
  <input matInput formControlName="firstName" [readonly]="!canEdit()" />
  @if (address.get('firstName')?.hasError('required')) {
    <mat-error>First name is required</mat-error>
  }
</mat-form-field>
```

Source: `src/app/checkout/address/address.html:18-24`

### Image zoom directive

Product images use a custom attribute directive with pointer events and a signal input:

```html
<img
  class="img-fluid"
  [src]="imagesBaseUrl + selectedImage()"
  appImageZoom
  [zoom]="2.5"
  alt="Product image"
/>
```

Source: `src/app/Shop/product-details/product-details.html:9-15`

### Accessibility

ARIA attributes appear in several templates, but not systematically:

```html
<mat-radio-group
  aria-label="Select a delivery method"
  formControlName="id"
  class="delivery-options"
>
```

Source: `src/app/checkout/delivery/delivery.html:6-10`

```html
<section class="activation-container">
```

Source: `src/app/Identity/active-account/active-account.html:1` (no label, purely decorative buttons)

Several images intentionally use empty `alt=""` (`shop-item.html:5`, `basket.html:32`) while others use descriptive alt text.

---

## Forms

Both form approaches are in use.

### Reactive forms

Reactive forms are built with `FormBuilder` and validated with `Validators`:

```ts
constructor(
  private fb: FormBuilder,
  private identityService: IdentityService,
  private toastr: ToastrService,
  private router: Router,
) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?=.*[0-9])(?=.*[#$@!.\-])[A-Za-z\d#$@!.\-]{8,}$/),
      ],
    ],
  });
}
```

Source: `src/app/Identity/login/login.ts:22-38`

Template access to controls is via getters prefixed with an underscore:

```ts
get _email() {
  return this.loginForm.get('email');
}

get _password() {
  return this.loginForm.get('password');
}
```

Source: `src/app/Identity/login/login.ts:40-46`

Validation feedback combines `[class.is-invalid]`, `[class.is-valid]`, and `@if` blocks on `errors`:

```html
<div class="text-danger validation-message">
  @if (_email?.touched && _email?.errors?.['required']) {
    <span>Email is required.</span>
  }

  @if (_email?.touched && _email?.errors?.['email']) {
    <span>Please enter a valid email address.</span>
  }
</div>
```

Source: `src/app/Identity/login/login.html:46-54`

The checkout stepper owns the form groups and passes them down as `@Input()`:

```ts
export class StepperOverviewExample {
  private fb = inject(FormBuilder);

  address = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    city: ['', Validators.required],
    street: ['', Validators.required],
    zipCode: ['', Validators.required],
    state: ['', Validators.required],
  });

  deliveryForm = this.fb.group({
    id: ['', Validators.required],
  });
}
```

Source: `src/app/checkout/stepper/stepper.ts:27-42`

Cross-field validation uses a static validator function:

```ts
private static passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}
```

Source: `src/app/Identity/reset-password/reset-password.ts:64-73`

Password rules are duplicated as an inline regex in login and register and as a module constant in reset-password.

### Template-driven forms

Search, sorting, quantity and rating inputs use `ngModel` with `FormsModule`:

```html
<select
  [ngModel]="productParams.sort"
  (ngModelChange)="onSortChange($event)"
  name=""
  class="form-select custom-select"
  id=""
>
  @for (item of SortingOption; track $index) {
    <option [value]="item.value">{{ item.name }}</option>
  }
</select>
```

Source: `src/app/Shop/shop.html:13-23`

```html
<input
  type="radio" class="star-input" id="rating-5" name="product-rating" [value]="5"  [(ngModel)]="selectedStars"/>
<label class="star-label" for="rating-5" aria-label="5 stars">★</label>
```

Source: `src/app/Orders/order-item/order-item.html:161-162`

A template-driven control can be embedded inside a reactive form by using standalone `ngModel` options:

```html
<input
  type="email"
  id="resetEmail"
  class="form-control"
  placeholder="example@email.com"
  [(ngModel)]="emailModel"
  [ngModelOptions]="{ standalone: true }"
/>
```

Source: `src/app/Identity/login/login.html:177-184`

Submit handlers follow two patterns: `(ngSubmit)` in login (`login.html:12`) and `(submit)` in register/reset-password (`register.html:5`, `reset-password.html:13`).

---

## Styling

### Component styles

Each component has a component-scoped SCSS file referenced by `styleUrl`. Styles are organized with SCSS variables at the top, nested selectors, and media queries inside the relevant selector:

```scss
$primary-color: #3f51b5;
$secondary-color: #5c6bc0;
$accent-color: #ff4081;
$light-color: #ffffff;
$dark-color: #212121;
$navbar-height: 60px;
$navbar-padding: 1rem;
$input-border-radius: 0.5rem;
$transition-duration: 0.3s;

.navbar {
  background: linear-gradient(45deg, $primary-color, $secondary-color);
  padding: 0.5rem $navbar-padding;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0;
```

Source: `src/app/Core/nav-bar-component/nav-bar-component.scss:1-20`

Variables are declared per component and duplicated with different values across files. For example, `$primary-color` is `#3f51b5` in the navbar and `#7961ff` in `shop.scss:1` and `shop-item.scss:1`. There is no shared SCSS partial or `_variables.scss`.

The `:host` selector is used in at least one component:

```scss
:host {
  display: block;
  min-width: 0;
}
```

Source: `src/app/Orders/order-item/order-item.scss:1-4`

Some SCSS files mix Arabic and English comments:

```scss
// زرار الهمبرجر
.navbar-toggler {
```

Source: `src/app/Core/nav-bar-component/nav-bar-component.scss:32-33`

### Global styles and theming

Angular Material theming is set up globally with the `mat.theme()` mixin:

```scss
@use '@angular/material' as mat;

html {
  height: 100%;
  @include mat.theme(
    (
      color: (
        primary: mat.$azure-palette,
        tertiary: mat.$blue-palette,
      ),
      typography: Roboto,
      density: 0,
    )
  );
}
```

Source: `src/styles.scss:6-20`

Bootstrap, Bootstrap Icons, Font Awesome, ngx-spinner animations, and Toastr CSS are all registered globally in `angular.json:32-39`.

### Bootstrap utilities in templates

Layout relies on Bootstrap utility classes rather than custom CSS where convenient:

```html
<div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
```

Source: `src/app/Shop/shop.html:43`

`!important` is used in a few places to override Bootstrap, for example `navbar-component.scss:135`, `:140`, and `login.scss:6`.

---

## Routing

Routes use standalone `loadComponent` for lazy loading, with the home route eagerly imported. The empty path redirects to `shop`:

```ts
export const routes: Routes = [
  { path: '', redirectTo: 'shop', pathMatch: 'full' },
  { path: 'home', component: Home },
  {
    path: 'shop',
    loadComponent: () => import('./Shop/shop').then((m) => m.Shop),
  },
```

Source: `src/app/app.routes.ts:4-10`

All other feature routes are lazy-loaded, including parameterized detail routes:

```ts
{
  path: 'product-details/:id',
  loadComponent: () =>
    import('./Shop/product-details/product-details').then((m) => m.ProductDetails),
},
```

Source: `src/app/app.routes.ts:49-53`

There is no wildcard route; it is commented out:

```ts
// { path: '**', redirectTo: 'shop', pathMatch: 'full' },
```

Source: `src/app/app.routes.ts:54`

There are **no route guards** in the project. Links to `/about` and `/best-seller` exist in the navbar but have no corresponding routes (`src/app/Core/nav-bar-component/nav-bar-component.html:31`, `:37`).

Route parameters are read with `ActivatedRoute`. `ProductDetails` subscribes to `paramMap`:

```ts
ngOnInit(): void {
  this.activatedRoute.paramMap.subscribe((params) => {
    this.currentId = Number(params.get('id'));
    this.shopService.getProductById(this.currentId).subscribe({
      next: (productRes) => {
        this.product.set(productRes);
        this.selectedImage.set(productRes.photos?.[0]?.imageName ?? '');
      },
      error: (err) => {
        console.log(err);
      },
    });
  });
}
```

Source: `src/app/Shop/product-details/product-details.ts:27-40`

Query parameters are read with `snapshot.queryParamMap` in `ResetPassword` (`reset-password.ts:51-53`) and with a `take(1)` subscription in `ActiveAccount` (`active-account.ts:29`). `SuccessComponent` subscribes to `queryParams` without unsubscribing:

```ts
ngOnInit(): void {
  this.route.queryParams.subscribe((param) => {
    this.orderId = param['orderId'];
  });
}
```

Source: `src/app/checkout/success/success.ts:12-16`

Programmatic navigation uses both `Router.navigateByUrl` (`login.ts:58`) and `Router.navigate` with `queryParams` (`payment.ts:34`).

---

## Testing

Tests are Vitest specs using Angular's `TestBed`. They are generated CLI boilerplate: almost every component spec only asserts that the component can be created.

```ts
describe('Shop', () => {
  let component: Shop;
  let fixture: ComponentFixture<Shop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shop],
    }).compileComponents();

    fixture = TestBed.createComponent(Shop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

Source: `src/app/Shop/shop.spec.ts:4-20`

Several specs are stale and reference names that no longer exist, so they would not compile as written:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Basket } from './basket';

describe('Basket', () => {
  let component: Basket;
  let fixture: ComponentFixture<Basket>;
```

Source: `src/app/Basket/basket/basket.spec.ts:1-6` (the component class is `BasketComponent`)

The same mismatch exists in `src/app/checkout/stepper/stepper.spec.ts:2` (`Stepper` vs `StepperOverviewExample`) and `src/app/checkout/success/success.spec.ts:2` (`Success` vs `SuccessComponent`). The root spec still expects the removed starter template heading:

```ts
it('should render title', async () => {
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  const compiled = fixture.nativeElement as HTMLElement;
  expect(compiled.querySelector('h1')?.textContent).toContain('Hello, clientNg');
});
```

Source: `src/app/app.spec.ts:18-23`

The only substantive test is the credential interceptor spec, which verifies the refresh-and-retry flow and concurrent refresh sharing:

```ts
http.get(`${environment.baseUrl}/Order/Get-Orders-for-User`).subscribe((value) => {
  response = value;
});

const originalRequest = httpTestingController.expectOne(
  `${environment.baseUrl}/Order/Get-Orders-for-User`,
);
expect(originalRequest.request.withCredentials).toBe(true);
originalRequest.flush({}, { status: 401, statusText: 'Unauthorized' });
```

Source: `src/app/Core/Interceptors/credential-interceptor.spec.ts:40-48`

Service specs do not use `HttpTestingController`; they instantiate the service and assert `toBeTruthy()` (`src/app/Shop/shop-service.spec.ts:4-14`).

---

## Conventions Consistently Followed

These patterns are applied broadly and can be treated as the project's de facto standard:

1. **Standalone components only.** No NgModules exist; every component declares its dependencies in `imports`.
2. **External templates and styles.** `templateUrl` + `styleUrl` are used everywhere; no inline templates or styles.
3. **`app` selector prefix.** Every selector is `app-*`, matching `angular.json:18`.
4. **Kebab-case file names.** Component, service, directive, and model file names consistently use kebab-case, even where class names drop the suffix.
5. **`I`-prefixed interfaces in `Shared/Models`.** Request and response shapes are plain interfaces (plus one class factory for `Basket`).
6. **Signals for local and shared state.** `signal`, `computed`, `asReadonly`, and `set()` are the default state primitives.
7. **Root-provided services.** All services use `@Injectable({ providedIn: 'root' })`.
8. **Functional interceptors.** Both interceptors are `HttpInterceptorFn` registered via `withInterceptors` in `app.config.ts`.
9. **Built-in template control flow.** `@if`, `@for`, `@else`, and `@let` replace all structural directives.
10. **Bootstrap utility-first markup** combined with component-scoped SCSS for custom visuals.
11. **Reactive forms plus `FormBuilder`** for authentication and checkout; template-driven forms for lightweight filter/quantity inputs.
12. **Consistent HTTP base URL composition** with template strings against `environment.baseUrl`; image URLs against `environment.imagesBaseUrl`.
13. **Toastr for user-facing outcomes** and `console.*` for developer diagnostics.
14. **Prettier + EditorConfig** define formatting (100 columns, single quotes, two-space indent), even though not all files are formatted to it.

---

## Areas for Improvement

The items below are honest observations, not requests to rewrite the application. Each is localized and can be fixed incrementally.

### Naming and structure

- **`order-srevice` typo.** The file, class, and spec are misspelled (`src/app/Orders/order-srevice.ts:10`, `src/app/Orders/order-srevice.spec.ts:2`). Renaming touches only three consumers: `order.ts:3`, `order-item.ts:2`, and the spec.
- **Mixed folder casing.** `Core`, `Shared`, `Shop`, `Basket`, `Identity`, `Orders`, `Home` are PascalCase while `checkout` is lowercase. Pick one convention.
- **Pagination component placed under `Shared/Models/Components`** rather than `Shared/Components` (`src/app/Shared/Models/Components/pagination/pagination.ts:1`).
- **Inconsistent class suffixes.** `BasketComponent`, `SuccessComponent`, `NavBarComponent` keep the suffix while `Shop`, `Order`, `Login` do not; `StepperOverviewExample` still carries the Angular schematic name (`src/app/checkout/stepper/stepper.ts:27`).

### Configuration and consistency

- **Duplicated environments.** `environment.ts` and `environment.development.ts` are identical (`src/environments/environment.ts:1-4`, `src/environments/environment.development.ts:1-4`). A single source or real per-environment values would avoid drift. `app.ts` also imports `environment.development` without using it (`src/app/app.ts:5`).
- **No ESLint.** The project has Prettier but no linting. Adding `angular-eslint` (and a `lint` script) would catch unused imports like `computed` (`nav-bar-component.ts:1`), `toSignal` (`nav-bar-component.ts:3`, `basket.ts:4`), `BehaviorSubject` (`basket-service.ts:2`), `Service` (`checkout-service.ts:2`, `identity-service.ts:2`), `Toast` (`product-details.ts:10`), and `consumerPollProducersForChange` (`delivery.ts:7`).
- **Mixed DI styles.** Constructor injection and `inject()` are used side by side. Choosing `inject()` consistently would align with the standalone/signal direction already visible in newer files.

### State and data flow

- **`count` computed fallback bug.** `?? 0` sits outside `computed()` (`src/app/Basket/basket-service.ts:22`), so the fallback never applies. Move it inside the reducer or use `?? 0` on the reduced value.
- **No unsubscription strategy.** Router subscriptions in `ProductDetails` (`product-details.ts:28`), `OrderItem` (`order-item.ts:31`), and `SuccessComponent` (`success.ts:13`) live until component destruction; `takeUntilDestroyed` or `toSignal` would prevent leaks and better match the signal-based state.
- **Unused `BehaviorSubject` import** suggests an abandoned RxJS state design (`src/app/Basket/basket-service.ts:2`).
- **`console.log` in production paths**, including basket saves (`basket-service.ts:105`) and order loading (`order.ts:25`, `order-item.ts:42`).

### Services and typing

- **`any` payloads.** `IdentityService.register/login` (`identity-service.ts:14`, `:17`), `CheckoutService.updateAddress` (`checkout-service.ts:13`), and `originalAddress: any` (`address.ts:31`) bypass the model layer.
- **Hard-coded `pageSize`.** `shop-service.ts:29` sends `2`, ignoring `ProductParams.pageSize` (`ProductParams.ts:6`) and the UI's displayed page size.
- **Missing return types** on most `CheckoutService`, `IdentityService`, and `OrderSrevice` methods, while `ShopService` annotates them. Inconsistent but harmless.
- **Manual error handling per component.** There is no shared error interceptor or notification service, so behavior differs (`console.log` vs toastr vs empty error callbacks such as `order.ts:28`).

### Routing and navigation

- **No guards.** Basket, checkout, and orders are reachable without authentication; the credential interceptor only reacts after a 401.
- **Wildcard route commented out** (`app.routes.ts:54`), so unknown URLs render an empty outlet.
- **Dead links.** `/about` and `/best-seller` are linked in the navbar (`nav-bar-component.html:31`, `:37`) but are not registered in `app.routes.ts`.
- **Bug in unused navigation helper.** `navigateToShopping` concatenates the API base URL with a client route (`product-details.ts:78`), producing `https://localhost:7198/api/shop` if ever called.
- **Home is eager** while every other feature is lazy (`app.routes.ts:6`). Minor, but inconsistent.

### Templates and forms

- **Reset-password submit button is always disabled.** `[disabled]="resetPasswordForm"` evaluates to a truthy object (`reset-password.html:128`); it should use `resetPasswordForm.invalid || isSubmitting`.
- **Stray Markdown fence** at the end of the login template (`login.html:212`).
- **Template-driven `ngModel` inside reactive forms** requires `[ngModelOptions]="{ standalone: true }"` (`login.html:183`), which works but mixes paradigms.
- **Password regex duplicated** in `login.ts:34` and `register.ts:28`, with a third variant in `reset-password.ts:15`.
- **Accessibility is partial**: some clickable elements are bare links/buttons without labels (`active-account.html:15`, `:23`), and several product images use `alt=""`.
- **`EventEmitter` untyped** (`pagination.ts:14`), losing the `PageChangedEvent` type at the boundary.

### Styling

- **Duplicated SCSS variables** across components with divergent values (`navbar-component.scss:1` vs `shop.scss:1` vs `shop-item.scss:1`). A shared `_variables.scss` would align the palette.
- **Mixed languages in comments** (Arabic and English in the same file, e.g. `navbar-component.scss:32`, `order-item.scss:10`), which is fine for a personal project but inconsistent for a team.
- **Several empty style files** (`app.scss`, `checkout.scss`, `payment.scss`, `success.scss`, `home.scss`, `pagination.scss`) still referenced by `styleUrl`.

### Testing

- **Specs are CLI boilerplate** and several are broken by stale class names: `basket.spec.ts:2` imports `Basket` (actual `BasketComponent`), `stepper.spec.ts:2` imports `Stepper` (actual `StepperOverviewExample`), and `success.spec.ts:2` imports `Success` (actual `SuccessComponent`).
- **Root spec asserts removed starter markup** (`app.spec.ts:22`).
- **No service HTTP tests.** Only `credential-interceptor.spec.ts` exercises real behavior; `ShopService`, `BasketService`, `CheckoutService`, `IdentityService`, and `OrderSrevice` have creation-only specs.
- **No tests for the basket totals, pagination emission, or form validators**, which are the most logic-heavy parts of the app.
