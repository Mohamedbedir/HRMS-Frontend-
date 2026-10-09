import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-employee-pagination',
  styleUrl: './employee-pagination.css',
  templateUrl: './employee-pagination.html',
})
export class EmployeePagination {
   @Input()
  currentPage = 1;

  @Input()
  totalPages = 1;

  @Input()
  hasPreviousPage = false;

  @Input()
  hasNextPage = false;

  @Output()
  pageChange = new EventEmitter<number>();


  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.pageChange.emit(page);

  }


  get pages(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );

  }

}
