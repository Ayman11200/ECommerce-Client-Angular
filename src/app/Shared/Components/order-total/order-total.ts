import { Component, inject } from '@angular/core';
import { BasketService } from '../../../Basket/basket-service';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-order-total',
  styleUrl: './order-total.scss',
  templateUrl: './order-total.html',
})
export class OrderTotal {
  basketService = inject(BasketService);
}
