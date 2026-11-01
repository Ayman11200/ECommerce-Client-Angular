import { v4 as uuidv4 } from 'uuid';

export interface IBasket {
  id: string;
  basketItems: IBasketItem[];
  paymentIntentId: string | null;
  clientSecret: string | null;
}

export interface IBasketItem {
  productId: number;
  name: string;
  description: string;
  quantity: number;
  image: string;
  price: number;
  categoryName: string;
}

export class Basket implements IBasket {
  id = uuidv4();
  paymentIntentId: string | null = null;
  clientSecret: string | null = null;
  basketItems: IBasketItem[] = [];
}
