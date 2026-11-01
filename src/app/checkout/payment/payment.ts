import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  Input,
  signal,
  OnDestroy,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from '@relynn/ngx-toastr';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

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


  complete = signal(false);
  paying = signal(false);
  paid = signal(false);

  canPay = computed(
    () => !this.loading() && !this.paying() && !this.error() && (this.complete() || this.paid()),
  );

  private lastDeliveryMethodId: number | null = null;
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
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
      this.stripe = await loadStripe(environment.stripePublishableKey);
      if (!this.stripe) return this.fail('Failed to load Stripe. Please check your connection.');

      // بنحتفظ بالـ elements عشان نستخدمها وقت الدفع
      this.elements = this.stripe.elements({ clientSecret });

      this.paymentElement = this.elements.create('payment', { layout: 'tabs' });
      this.paymentElement.mount(this.paymentDiv.nativeElement);

      // كل ما العميل يكتب في الكارت ستريب يبلّغنا هل الفورم كمل ولا لأ
      this.paymentElement.on('change', (event) => this.complete.set(event.complete));

      this.loading.set(false);
    } catch {
      this.fail('Unable to initialize payment form. Please try again.');
    }
  }


  async pay(): Promise<void> {
    if (!this.stripe || !this.elements || this.paying()) return;

    this.paying.set(true);

    if (this.paid()) {
      this.createOrder();
      return;
    }

    const { error, paymentIntent } = await this.stripe.confirmPayment({
      elements: this.elements, //الفورم اللي المستخدم دخل فيه بيانات الكارت

      confirmParams: { return_url: `${window.location.origin}/success` },  //إعدادات تأكيد الدفع، ومنها رابط الرجوع بعد الـ Redirect.

      redirect: 'if_required', // الكروت العادية ما بتعملش redirect
    });

    if (error) {
      this.paying.set(false);
      this.toastr.error(error.message ?? 'Payment failed.', 'PAYMENT FAILED');
      return;
    }

    // if proccessing or other
    if (paymentIntent?.status !== 'succeeded') {
      this.paying.set(false);
      this.toastr.info('Your payment is still being processed.', 'PROCESSING');
      return;
    }

    this.paid.set(true);
    this.createOrder();
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
    this.complete.set(false);
  }

  ngOnDestroy(): void {
    this.destroyElement();
  }

  createOrder(): void {
    const order = this.getOrder();

    this.checkoutService.createOrder(order).subscribe({
      next: (value) => {
        this.basketService.deleteBasket(order.basketId);
        this.router.navigate(['/success'], { queryParams: { orderId: value.id } });
        this.toastr.success('Order created successfully', 'SUCCESS');
      },
      error: () => {
        this.paying.set(false);
        this.toastr.error(
          'Payment succeeded but creating the order failed. Press "Complete order" to retry. Do not pay again.',
          'ERROR',
        );
      },
    });
  }

  getOrder(): ICreateOrder {
    return {
      basketId: this.basketService.basket()?.id!,
      deliveryMethodId: Number(this.delivery.value.id),
      shippingAddressDto: this.address.value,
    };
  }
}
