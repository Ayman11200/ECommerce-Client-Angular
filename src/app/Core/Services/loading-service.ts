import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private requestCount: number = 0;

  constructor(private spinner: NgxSpinnerService) {}

  show(): void {
    this.requestCount++;

    if (this.requestCount === 1) {
      this.spinner.show('primary');
    }
  }

  hide(): void {
    if (this.requestCount > 0) {
      this.requestCount--;
    }

    if (this.requestCount === 0) {
      this.spinner.hide('primary');
    }
  }
}
