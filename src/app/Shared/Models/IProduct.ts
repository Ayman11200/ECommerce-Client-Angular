export interface IProduct {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  newPrice: number;
  oldPrice: number;
  categoryName: string;
  photos: IPhoto[];
}

export interface IPhoto {
  imageName: string;
  productId: number;
}
