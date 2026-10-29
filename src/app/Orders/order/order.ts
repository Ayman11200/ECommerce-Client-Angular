import { Component, inject, OnInit, signal } from '@angular/core';
import { IOrder } from '../../Shared/Models/IOrder';
import { OrderSrevice } from '../order-srevice';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  imports: [DatePipe, CurrencyPipe ],
  selector: 'app-order',
  styleUrl: './order.scss',
  templateUrl: './order.html',
})
export class Order implements OnInit {
  private orderService = inject(OrderSrevice);

  orders = signal<IOrder[]>([]);

  ngOnInit(): void {
    this.orderService.getOrdersForUser().subscribe({
      next: (val) => {
        console.log(val);
        this.orders.set(val);
      },
      error: (err) => {}
    })
  }

}
