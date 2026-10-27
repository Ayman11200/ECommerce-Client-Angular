import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ShopService } from '../shop-service';
import { IProduct } from '../../Shared/Models/IProduct';
import { environment } from '../../../environments/environment';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ImageZoom } from '../../Shared/Directives/image-zoom';
import { FormsModule } from '@angular/forms';
import { BasketService } from '../../Basket/basket-service';
import { Toast, ToastrService } from '@relynn/ngx-toastr';

@Component({
  imports: [CurrencyPipe, DecimalPipe, ImageZoom, FormsModule, RouterLink],
  selector: 'app-product-details',
  styleUrl: './product-details.scss',
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private shopService: ShopService,
    private basketService: BasketService,
    private router: Router,
    private toaster: ToastrService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.currentId = Number(params.get('id'));
      this.shopService.getProductById(this.currentId).subscribe({
        next: (productRes) => {
          this.product.set(productRes);
          this.selectedImage.set(productRes.photos?.[0]?.imageName ?? '');
        },
        error: (err) => {
          console.log(err);
        },
      });
    });
  }

  currentId!: number;
  product = signal<IProduct | null>(null);
  selectedImage = signal<string>('');
  imagesBaseUrl = environment.imagesBaseUrl;
  quantity: number = 1;

  getDiscount(): number {
    const p = this.product();
    if (!p || !p.oldPrice || !p.newPrice) {
      return 0;
    }
    return ((p.oldPrice - p.newPrice) / p.oldPrice) * 100;
  }

  onAddToCart() {
    const product = this.product();
    if (!product) return;

    this.basketService.addItem(product, this.quantity);
  }

  increaseQuantity() {
    if (this.quantity < 10) {
      this.quantity++;
    } else {
      this.toaster.error("You cant add More than 10 Items to the basket","ERROR")
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  navigateToShopping() {
    this.router.navigateByUrl(`${environment.baseUrl}/shop`);
  }
}
