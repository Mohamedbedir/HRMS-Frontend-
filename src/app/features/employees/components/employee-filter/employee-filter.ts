import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';


export interface EmployeeFilter {
  status: string;
  orderBy: string;
}
@Component({
  imports: [FormsModule],
  selector: 'app-employee-filter',
  styleUrl: './employee-filter.css',
  templateUrl: './employee-filter.html',
})
export class EmployeeFilterComponent {
  @Output()
  filterChange = new EventEmitter<EmployeeFilter>();

  status = '';
  orderBy = 'Id';

  applyFilters(): void {
    this.filterChange.emit({
      status: this.status,
      orderBy: this.orderBy,
    });
  }

  resetFilters(): void {
    this.status = '';
    this.orderBy = 'Id';
    this.applyFilters();
  }
}
