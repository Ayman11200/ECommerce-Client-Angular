import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShopService } from '../Shop/shop-service';
import { ICategory } from '../Shared/Models/ICategory';

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private shopService = inject(ShopService);

  categories = signal<ICategory[]>([]);

  ngOnInit(): void {
    this.shopService.getAllCategories().subscribe({
      next: (categoriesRes) => {
        this.categories.set(categoriesRes);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      },
    });
  }
}
