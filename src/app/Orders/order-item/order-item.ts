import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderSrevice } from '../order-srevice';
import { ActivatedRoute } from '@angular/router';
import { IOrder } from '../../Shared/Models/IOrder';
import { environment } from '../../../environments/environment';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { IRating } from '../../Shared/Models/IRating';
import { Modal } from 'bootstrap';

@Component({
  imports: [CurrencyPipe, FormsModule],
  selector: 'app-order-item',
  styleUrl: './order-item.scss',
  templateUrl: './order-item.html',
})
export class OrderItem implements OnInit {
  private orderService = inject(OrderSrevice);
  private activatedRoute = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  order = signal<IOrder>({} as IOrder);
  orderId: number = 0;
  imageBaseUrl = environment.imagesBaseUrl;
  selectedStars: number | null = null;
  reviewContent: string | null = null;
  selectedProductId: number | null = null;

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

  addRating() {
    if (this.selectedStars === null) {
      this.toastr.error('Please select a star to add the review', 'Select Rating');
      return;
    }

    if (this.selectedProductId === null) {
      this.toastr.error('Please select a product', 'Error');
      return;
    }

    const rating: IRating = {
      stars: this.selectedStars,
      comment: this.reviewContent ?? '',
      productId: this.selectedProductId,
    };

    this.orderService.addRating(rating).subscribe({
      next: () => {
        this.toastr.success('Your review was submitted successfully');

        const modalElement = document.getElementById('ratingModal');

        if (modalElement) {
          Modal.getInstance(modalElement)?.hide();
        }
      },
      error: () => {
        this.toastr.error('Failed to submit your review');
      },
    });
  }
}
