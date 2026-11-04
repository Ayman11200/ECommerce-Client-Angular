import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShopService } from '../Shop/shop-service';
import { ShopItem } from '../Shop/shop-item/shop-item';
import { IProduct } from '../Shared/Models/IProduct';

@Component({
  imports: [ShopItem, RouterLink],
  selector: 'app-best-seller',
  styleUrl: './best-seller.scss',
  templateUrl: './best-seller.html',
})
export class BestSeller implements OnInit {
  private shopService = inject(ShopService);

  products = signal<IProduct[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.shopService.getBestSellers().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load the best sellers. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
