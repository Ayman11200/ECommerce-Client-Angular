import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CheckoutService } from '../checkout-service';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
  ],
  templateUrl: './address.html',
  styleUrl: './address.scss',
})
export class Address implements OnInit {
  @Input() address!: FormGroup;

  private checkoutService = inject(CheckoutService);

  canEdit = signal(true);
  isSaved = signal(false);
  private originalAddress: any;

  ngOnInit(): void {
    this.checkoutService.getAddress().subscribe({
      next: (value) => {
        this.address.patchValue(value);
        this.canEdit.set(false);
        this.isSaved.set(true);
        this.originalAddress = this.address.value;
      },
      error: (err) => console.log(err),
    });
  }

  updateAddress(): void {
    if (this.address.invalid) {
      this.address.markAllAsTouched();
      return;
    }

    this.checkoutService.updateAddress(this.address.value).subscribe({
      next: (val) => {
        console.log(val);
        this.canEdit.set(false);
        this.isSaved.set(true);
        this.originalAddress = this.address.value;
      },
      error: (err) => console.log(err),
    });
  }

  cancelEdit() {
    this.canEdit.set(false);
    this.address.patchValue(this.originalAddress);
  }
}
