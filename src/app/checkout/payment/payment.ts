import { Component, inject, Input, OnInit } from '@angular/core';
import { CheckoutService } from '../checkout-service';
import { BasketService } from '../../Basket/basket-service';
import { ICreateOrder } from '../../Shared/Models/IOrder';
import { FormGroup } from '@angular/forms';

@Component({
  imports: [],
  selector: 'app-payment',
  styleUrl: './payment.scss',
  templateUrl: './payment.html',
})
export class Payment implements OnInit {
  private checkoutService = inject(CheckoutService);
  private basketService = inject(BasketService);

  @Input() delivery!: FormGroup;
  @Input() address!: FormGroup;

  ngOnInit(): void {
    this.createOrder();
  }

  createOrder() {
    const order = this.getOrder();
    this.checkoutService.createOrder(order).subscribe({
      next: (result) => console.log('Order created', result),
      error: (err) => console.error('Order creation failed', err),
    });
  }

  getOrder(): ICreateOrder {
    return {
      basketId: this.basketService.basket()?.id!,
      deliveryMethodId: this.delivery.value.id,
      shippingAddressDto: this.address.value,
    };
  }
}
