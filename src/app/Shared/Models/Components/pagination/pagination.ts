import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageChangedEvent, PaginationComponent } from 'ngx-bootstrap/pagination';

@Component({
  imports: [PaginationComponent],
  selector: 'app-pagination',
  styleUrl: './pagination.scss',
  templateUrl: './pagination.html',
})
export class Pagination {
  @Input() pageSize: number = 4;
  @Input() totalCount: number = 0;

  @Output() pageChanged = new EventEmitter();
  emit(event: PageChangedEvent) {
    this.pageChanged.emit(event);
  }
}
