import { Component, OnInit, signal } from '@angular/core';
import { IProduct } from '../Shared/Models/IProduct';
import { ShopService } from './shop-service';
import { ShopItem } from './shop-item/shop-item';
import { ICategory } from '../Shared/Models/ICategory';
import { FormsModule } from '@angular/forms';
import { PaginationModule, PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ProductParams } from '../Shared/Models/ProductParams';
import { Pagination } from '../Shared/Models/Components/pagination/pagination';
import { ToastrService } from '@relynn/ngx-toastr';

@Component({
  imports: [ShopItem, FormsModule, PaginationModule, Pagination],
  selector: 'app-shop',
  styleUrl: './shop.scss',
  templateUrl: './shop.html',
})
export class Shop implements OnInit {
  constructor(
    private shopService: ShopService,
    private toastrService: ToastrService,
  ) {}
  ngOnInit(): void {
    this.getAllProducts();
    this.getAllCategories();
  }
  // s?
  products = signal<IProduct[]>([]);
  categories = signal<ICategory[]>([]);
  totalCount = signal<number>(0);
  productParams = new ProductParams();
  searchText: string = '';

  SortingOption = [
    { name: 'Name', value: 'Name' },
    { name: 'Price: Low to High', value: 'PriceAsc' },
    { name: 'Price: High to Low', value: 'PriceDes' },
  ];

  getAllProducts() {
    // b w ?
    this.shopService.getAllProducts(this.productParams).subscribe({
      next: (paginationRes) => {
        this.products.set(paginationRes.data);
        this.totalCount.set(paginationRes.totalCount);
        this.productParams.pageNumber = paginationRes.pageNumber;
        this.productParams.pageSize = paginationRes.pageSize;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      },
    });
  }

  getAllCategories() {
    this.shopService.getAllCategories().subscribe({
      next: (categoriesRes) => {
        this.categories.set(categoriesRes);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      },
    });
  }

  filterByCatId(categoryId: number) {
    this.productParams.categoryId = categoryId;
    this.productParams.pageNumber = 1;
    this.getAllProducts();
  }

  onSortChange(sortValue: string) {
    this.productParams.sort = sortValue;
    this.productParams.pageNumber = 1;
    this.getAllProducts();
  }

  onSearch() {
    this.productParams.search = this.searchText.trim();
    this.productParams.pageNumber = 1;
    this.getAllProducts();
  }

  onPageChanged(page: number) {
    if (this.productParams.pageNumber !== page) {
      this.productParams.pageNumber = page;
      this.getAllProducts();
    }
  }

  onReset() {
    this.searchText = '';
    this.productParams = new ProductParams();
    this.getAllProducts();
  }
}
