import { Component } from '@angular/core';
import { StepperOverviewExample } from './stepper/stepper';
import { OrderTotal } from '../Shared/Components/order-total/order-total';

@Component({
  imports: [StepperOverviewExample, OrderTotal],
  selector: 'app-checkout',
  styleUrl: './checkout.scss',
  templateUrl: './checkout.html',
})
export class Checkout {}
