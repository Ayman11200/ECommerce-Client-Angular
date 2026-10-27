import { Component, computed, ElementRef, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BasketService } from '../../Basket/basket-service';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  imports: [RouterLink, RouterLinkActive, MatBadgeModule],
  selector: 'app-nav-bar-component',
  styleUrl: './nav-bar-component.scss',
  templateUrl: './nav-bar-component.html',
})
export class NavBarComponent {
  private elementRef = inject(ElementRef);
  private basketService = inject(BasketService);

  isCollapsed = true;
  visible = false;

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleDropDown() {
    this.visible = !this.visible;
  }

  closeAll() {
    this.visible = false;
    this.isCollapsed = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAll();
    }
  }
}
