import { computed, Injectable, signal } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { Basket, IBasket } from '../Shared/Models/IBasket';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IProduct } from '../Shared/Models/IProduct';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  constructor(private httpClient: HttpClient) {}

  private basketSignal = signal<IBasket | null>(null);
  basket = this.basketSignal.asReadonly();

  subtotal = computed(
    () => this.basket()?.basketItems.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0,
  );
  total = computed(() => this.subtotal() + this.shipping());

  count = computed(() => this.basket()?.basketItems.reduce((sum, i) => sum + i.quantity, 0)) ?? 0;

  private shippingSignal = signal(0);
  shipping = this.shippingSignal.asReadonly();

  setShippingPrice(price: number) {
    if (price < 0) return;
    this.shippingSignal.set(price);
  }

  loadBasket() {
    const id = localStorage.getItem('basketId');
    if (!id) return;

    this.httpClient.get<IBasket>(`${environment.baseUrl}/Basket/${id}`).subscribe({
      next: (basket) => this.basketSignal.set(basket),
      error: (err) => console.log(err),
    });
  }

  addItem(product: IProduct, quantity: number = 1) {
    const basket = this.copyBasket() ?? this.createBasket();
    const item = basket.basketItems.find((i) => i.productId === product.id);

    if (item) {
      item.quantity += quantity;
    } else {
      basket.basketItems.push(this.mapProductToItem(product, quantity));
    }
    this.saveBasket(basket);
  }

  increaseItem(productId: number) {
    const basket = this.copyBasket();
    const item = basket?.basketItems.find((i) => i.productId === productId);
    if (!basket || !item) return;

    item.quantity++;
    this.saveBasket(basket);
  }

  decreaseItem(productId: number) {
    const basket = this.copyBasket();
    const item = basket?.basketItems.find((i) => i.productId === productId);
    if (!basket || !item) return;

    if (item.quantity > 1) {
      item.quantity--;
      this.saveBasket(basket);
    } else {
      this.removeItem(productId);
    }
  }

  removeItem(productId: number) {
    const basket = this.copyBasket();
    if (!basket) return;

    basket.basketItems = basket.basketItems.filter((i) => i.productId !== productId);

    if (basket.basketItems.length > 0) {
      this.saveBasket(basket);
    } else {
      this.deleteBasket(basket.id);
    }
  }

  deleteBasket(id: string) {
    this.httpClient.delete(`${environment.baseUrl}/Basket/${id}`).subscribe({
      next: () => {
        this.basketSignal.set(null);
        localStorage.removeItem('basketId');
      },
      error: (err) => console.log(err),
    });
  }

  // --------------------

  private saveBasket(basket: IBasket) {
    this.httpClient.put<IBasket>(`${environment.baseUrl}/Basket`, basket).subscribe({
      next: (result) => {
        this.basketSignal.set(result);
        console.log(result);
      },
      error: (err) => console.log(err),
    });
  }

  private createBasket(): IBasket {
    const basket = new Basket();
    localStorage.setItem('basketId', basket.id);
    return basket;
  }

  private copyBasket(): IBasket | null {
    const current = this.basket();
    if (!current) return null;

    return { ...current, basketItems: current.basketItems.map((i) => ({ ...i })) };
  }

  private mapProductToItem(product: IProduct, quantity: number) {
    return {
      productId: product.id,
      name: product.name,
      description: product.description,
      quantity: quantity,
      image: product.photos[0]?.imageName,
      price: product.newPrice,
      categoryName: product.categoryName,
    };
  }
}
