import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderSrevice } from '../order-srevice';
import { ActivatedRoute } from '@angular/router';
import { IOrder } from '../../Shared/Models/IOrder';

@Component({
  imports: [],
  selector: 'app-order-item',
  styleUrl: './order-item.scss',
  templateUrl: './order-item.html',
})
export class OrderItem implements OnInit {
  private orderService = inject(OrderSrevice);
  private activatedRoute = inject(ActivatedRoute);

  order = signal<IOrder>({} as IOrder);
  orderId: number = 0;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        console.error('Invalid order ID in route');
        return;
      }
      this.orderId = id;

      this.orderService.getOrderById(this.orderId).subscribe({
        next: (val) => {
          console.log(val);
          this.order.set(val);
        },
        error: (err) => {
          console.log(err);
        },
      });
    });
  }
}
