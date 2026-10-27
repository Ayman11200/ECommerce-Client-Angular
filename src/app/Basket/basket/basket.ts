import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BasketService } from '../basket-service';
import { environment } from '../../../environments/environment';
import { OrderTotal } from '../../Shared/Components/order-total/order-total';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, OrderTotal],
  templateUrl: './basket.html',
  styleUrl: './basket.scss',
})
export class BasketComponent {
  basketService = inject(BasketService);
  imagesBaseUrl = environment.imagesBaseUrl;
}
