import { Component, inject, Input, OnInit } from '@angular/core';
import { CheckoutService } from '../checkout-service';
import { BasketService } from '../../Basket/basket-service';
import { ICreateOrder } from '../../Shared/Models/IOrder';
import { FormGroup } from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [MatButtonModule],
  selector: 'app-payment',
  styleUrl: './payment.scss',
  templateUrl: './payment.html',
})
export class Payment implements OnInit {
  private checkoutService = inject(CheckoutService);
  private basketService = inject(BasketService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  @Input() delivery!: FormGroup;
  @Input() address!: FormGroup;

  ngOnInit(): void {

  }

  createOrder() {
    const order = this.getOrder();
    this.checkoutService.createOrder(order).subscribe({
      next: (value) => {
        console.log('Order created', value);
        this.router.navigate(['/success'], { queryParams: { orderId: value.id } });
        this.toastr.success('Order created successfully', 'SUCCESS');
      },
      error: (err) => {
        this.toastr.error('Something went wrong', 'Error');
        console.error('Order creation failed', err);
      },
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
