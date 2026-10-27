import { Routes } from '@angular/router';
import { Shop } from './Shop/shop';
import { Home } from './Home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'shop', pathMatch: 'full' },
  { path: 'home', component: Home },
  {
    path: 'shop',
    loadComponent: () => import('./Shop/shop').then((m) => m.Shop),
  },
  {
    path: 'basket',
    loadComponent: () => import('./Basket/basket/basket').then((m) => m.BasketComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./Identity/register/register').then((m) => m.Register),
  },
  {
    path: 'active',
    loadComponent: () =>
      import('./Identity/active-account/active-account').then((m) => m.ActiveAccount),
  },
  {
    path: 'login',
    loadComponent: () => import('./Identity/login/login').then((m) => m.Login),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./Identity/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'product-details/:id',
    loadComponent: () =>
      import('./Shop/product-details/product-details').then((m) => m.ProductDetails),
  },
  { path: '**', redirectTo: 'shop', pathMatch: 'full' },
];
