import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { CheckoutService } from '../checkout-service';
import { BasketService } from '../../Basket/basket-service';
import { ICreateOrder } from '../../Shared/Models/IOrder';

@Component({
  selector: 'app-complete',
  templateUrl: './complete.html',
  styleUrl: './complete.scss',
})
export class Complete implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private basketService = inject(BasketService);
  private toastr = inject(ToastrService);

  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const paymentIntent = params['payment_intent'] || params['paymentIntent'];

      if (!paymentIntent) {
        this.error.set('Missing payment intent. Please return to checkout.');
        this.loading.set(false);
        return;
      }

      this.createOrderFromPaymentIntent();
    });
  }

  private createOrderFromPaymentIntent(): void {
    const basketId = this.basketService.basket()?.id ?? localStorage.getItem('basketId');
    const deliveryForm = (window as any).checkoutDeliveryForm;
    const addressForm = (window as any).checkoutAddressForm;

    if (!basketId || !deliveryForm || !addressForm) {
      this.error.set('Missing checkout data. Please go back to checkout and try again.');
      this.loading.set(false);
      this.toastr.error(this.error()!, 'ERROR');
      return;
    }

    const order: ICreateOrder = {
      basketId: basketId,
      deliveryMethodId: Number(deliveryForm.value.id),
      shippingAddressDto: addressForm.value,
    };

    this.checkoutService.createOrder(order).subscribe({
      next: (value) => {
        this.basketService.deleteBasket(order.basketId);
        // نمسح البيانات المحفوظة بعد نجاح إنشاء الأوردر
        delete (window as any).checkoutDeliveryForm;
        delete (window as any).checkoutAddressForm;
        this.toastr.success('Order created successfully', 'SUCCESS');
        this.router.navigate(['/success'], { queryParams: { orderId: value.id } });
      },
      error: (err) => {
        const message =
          err?.error?.message ??
          'Payment succeeded but creating the order failed. Please contact support.';
        this.error.set(message);
        this.loading.set(false);
        this.toastr.error(message, 'ERROR');
      },
    });
  }

  backToCheckout(): void {
    delete (window as any).checkoutDeliveryForm;
    delete (window as any).checkoutAddressForm;
    this.router.navigate(['/checkout']);
  }
}

