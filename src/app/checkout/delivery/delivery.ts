import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { IDeliveryMethod } from '../../Shared/Models/IDeliveryMethod';
import { CheckoutService } from '../checkout-service';
import { consumerPollProducersForChange } from '@angular/core/primitives/signals';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { BasketService } from '../../Basket/basket-service';

@Component({
  imports: [ReactiveFormsModule, MatRadioModule, MatStepperModule, MatButtonModule, CurrencyPipe],
  selector: 'app-delivery',
  styleUrl: './delivery.scss',
  templateUrl: './delivery.html',
})
export class Delivery implements OnInit {
  private checkoutService = inject(CheckoutService);
  private basketService = inject(BasketService);
  deliveryMethods = signal<IDeliveryMethod[]>([]);

  @Input() delivery!: FormGroup;

  ngOnInit(): void {
    this.checkoutService.getDeliveryMethod().subscribe({
      next: (methods) => this.deliveryMethods.set(methods),
      error: (err) => console.error('Failed to load delivery methods', err),
    });
  }

  setShippingRadio(selectedId: number) {
    const delivery = this.deliveryMethods().find((m) => m.id == selectedId);
    this.basketService.setShippingPrice(delivery?.price ?? 0);
  }
}
