import { Component } from '@angular/core';
import { StepperOverviewExample } from './stepper/stepper';

@Component({
  imports: [StepperOverviewExample],
  selector: 'app-checkout',
  styleUrl: './checkout.scss',
  templateUrl: './checkout.html',
})
export class Checkout {}
