import { Component, ElementRef, ViewChild, inject, Input, signal, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from '@relynn/ngx-toastr';
import { loadStripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

import { CheckoutService } from '../checkout-service';
import { BasketService } from '../../Basket/basket-service';
import { ICreateOrder } from '../../Shared/Models/IOrder';
import { environment } from '../../../environments/environment';
import { MatStepperPrevious } from '@angular/material/stepper';

@Component({
  imports: [MatButtonModule, MatStepperPrevious],
  selector: 'app-payment',
  styleUrl: './payment.scss',
  templateUrl: './payment.html',
})
export class Payment implements OnDestroy {
  private checkoutService = inject(CheckoutService);
  private basketService = inject(BasketService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  @Input() delivery!: FormGroup;
  @Input() address!: FormGroup;
  @ViewChild('paymentElement') private paymentDiv!: ElementRef<HTMLDivElement>;

  loading = signal(false);
  error = signal<string | null>(null);

  private lastDeliveryMethodId: number | null = null;
  private paymentElement: StripePaymentElement | null = null;

  initializePayment(): void {
    const basketId = this.basketService.basket()?.id ?? localStorage.getItem('basketId');
    if (!basketId) return this.error.set('Basket not found. Please add items to your basket.');

    const deliveryMethodId = Number(this.delivery.value.id);
    if (!deliveryMethodId)
      return this.error.set('Please select a delivery method before proceeding.');

    if (this.paymentElement && deliveryMethodId === this.lastDeliveryMethodId) return;

    this.lastDeliveryMethodId = deliveryMethodId;
    this.loading.set(true);
    this.error.set(null);
    this.destroyElement();

    this.basketService.createOrUpdatePayment(basketId, deliveryMethodId).subscribe({
      next: (res) => this.mountStripe(res.clientSecret),
      error: (err) =>
        this.fail(err?.error?.message ?? 'Payment initialization failed. Please try again.'),
    });
  }

  private async mountStripe(clientSecret: string | null): Promise<void> {
    if (!clientSecret) return this.fail('Payment cannot be initialized. Missing client secret.');

    try {
      const stripe = await loadStripe(environment.stripePublishableKey);
      if (!stripe) return this.fail('Failed to load Stripe. Please check your connection.');

      const elements: StripeElements = stripe.elements({ clientSecret });
      this.paymentElement = elements.create('payment', { layout: 'tabs' });
      this.paymentElement.mount(this.paymentDiv.nativeElement);
      this.loading.set(false);
    } catch {
      this.fail('Unable to initialize payment form. Please try again.');
    }
  }

  private fail(message: string): void {
    this.loading.set(false);
    this.error.set(message);
    this.toastr.error(message, 'ERROR');
    this.destroyElement();
  }

  private destroyElement(): void {
    this.paymentElement?.destroy();
    this.paymentElement = null;
  }

  ngOnDestroy(): void {
    this.destroyElement();
  }

  createOrder(): void {
    this.checkoutService.createOrder(this.getOrder()).subscribe({
      next: (value) => {
        this.router.navigate(['/success'], { queryParams: { orderId: value.id } });
        this.toastr.success('Order created successfully', 'SUCCESS');
      },
      error: () => this.toastr.error('Something went wrong', 'Error'),
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
