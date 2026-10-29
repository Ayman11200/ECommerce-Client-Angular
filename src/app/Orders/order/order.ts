import { Component, inject, OnInit, signal } from '@angular/core';
import { IOrder } from '../../Shared/Models/IOrder';
import { OrderSrevice } from '../order-srevice';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  imports: [DatePipe, CurrencyPipe, RouterLink],
  selector: 'app-order',
  styleUrl: './order.scss',
  templateUrl: './order.html',
})
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
