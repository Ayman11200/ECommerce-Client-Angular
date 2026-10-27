import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './Core/nav-bar-component/nav-bar-component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment.development';
import { IPagination } from './Shared/Models/IPagination';
import { IProduct } from './Shared/Models/IProduct';
import { Shop } from './Shop/shop';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { BasketService } from './Basket/basket-service';

@Component({
  imports: [NavBarComponent, RouterOutlet, NgxSpinnerComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  constructor(private basketService: BasketService) {}

  ngOnInit() {
    this.basketService.loadBasket();
  }
}
