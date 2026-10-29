export interface ICreateOrder {
  basketId: string;
  deliveryMethodId: number;
  shippingAddressDto: IShippingAddress;
}
export interface IShippingAddress {
  firstName: string;
  lastName: string;
  city: string;
  zipCode: string;
  street: string;
  state: string;
}

export interface IOrder {
  id: number;
  buyerEmail: string;
  subTotal: number;
  shippingAddress: IShippingAddress;
  total: number;
  orderDate: string;
  orderItems: IOrderItem[];
  deliveryMethod: string;
  status: string;
}
export interface IOrderItem {
  productItemId: number;
  mainImage: string;
  productName: string;
  description: string;
  price: number;
  quantity: number;
}
