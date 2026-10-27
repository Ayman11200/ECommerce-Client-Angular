import { CurrencyPipe } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { IProduct } from '../../Shared/Models/IProduct';
import { environment } from '../../../environments/environment';
import { RouterLink } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { BasketService } from '../../Basket/basket-service';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-shop-item',
  styleUrl: './shop-item.scss',
  templateUrl: './shop-item.html',
})
export class ShopItem {
  constructor(
    private toastrService: ToastrService,
    private basketService: BasketService,
  ) {}
  @Input() product: IProduct = {} as IProduct;
  selectedPhoto = signal(0);
  imagesBaseUrl = environment.imagesBaseUrl;

  onAddToCart() {
    this.toastrService.success('Product added to your cart successfully.', 'Added to Cart');
    this.basketService.addItem(this.product);
  }
}
