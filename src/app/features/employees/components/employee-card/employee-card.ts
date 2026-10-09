import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmployeeListItem } from '../../models/employee-list.model';
import { DatePipe } from '@angular/common';

@Component({
  imports: [DatePipe],
  selector: 'app-employee-card',
  styleUrl: './employee-card.css',
  templateUrl: './employee-card.html',
})
export class EmployeeCard {
  
  @Input({ required: true })
  employee!: EmployeeListItem;

  @Output()
  viewEmployee = new EventEmitter<number>();

  @Output()
  editEmployee = new EventEmitter<number>();


  get fullName(): string {

    return `${this.employee.firstName} ${this.employee.lastName}`;

  }


  get initials(): string {

    return (
      `${this.employee.firstName.charAt(0)}
      ${this.employee.lastName.charAt(0)}`
    ).trim().toUpperCase();

  }


  get statusClass(): string {

    switch (this.employee.status) {

      case 'Active':
        return 'bg-success-subtle text-success';

      case 'Suspended':
        return 'bg-warning-subtle text-warning-emphasis';

      case 'Terminated':
        return 'bg-danger-subtle text-danger';

      default:
        return 'bg-secondary-subtle text-secondary';

    }

  }
}