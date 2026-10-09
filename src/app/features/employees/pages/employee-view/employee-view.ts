import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeApiService } from '../../services/Employee.Service';
import { EmployeeDetails } from '../../models/employeedetails';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DateOrFallbackPipe } from '../../../../shared/pipes/date-or-fallback.pipe';
import { EmploymentHistory } from '../../components/employment-history/employment-history';
import { SalaryHistory } from '../../components/salary-history/salary-history';

@Component({
  imports: [DatePipe, CurrencyPipe, DateOrFallbackPipe, EmploymentHistory, SalaryHistory],
  selector: 'app-employee-view',
  styleUrl: './employee-view.css',
  templateUrl: './employee-view.html',
})
export class EmployeeView implements OnInit {

  private readonly route =inject(ActivatedRoute);

  private readonly router =inject(Router);

  private readonly employeeApiService =inject(EmployeeApiService);


  employee=signal<EmployeeDetails | null>(null);

  isLoading = true;

  hasError = false;

  activeTab: 'overview' | 'employment-history' | 'salary-history' = 'overview';

  ngOnInit(): void {

    const id =Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {

      this.hasError = true;
      this.isLoading = false;

      return;
    }

    this.loadEmployee(id);

  }


  loadEmployee(id: number): void {

    this.isLoading = true;
    this.hasError = false;

    this.employeeApiService.getEmployeeById(id).subscribe({

        next: response => {

          if (
            !response.succeeded ||
            !response.data
          ) {

            this.hasError = true;
            this.isLoading = false;

            return;
          }

          this.employee.set(response.data);

          this.isLoading = false;

        },

        error: error => {

          console.error('Failed to load employee', error);

          this.hasError = true;
          this.isLoading = false;

        }

      });

  }

  selectTab(tab: 'overview' | 'employment-history' | 'salary-history'): void {
    this.activeTab = tab;
  }


  goBack(): void {

    this.router.navigate(['/admin/employees']);

  }


  editEmployee(): void {

    const employeeId = this.employee()?.id;
    if (!employeeId) {
      return;
    }

    this.router.navigate(['/admin/employees', employeeId, 'edit']);

  }


  get initials(): string {

    if (!this.employee) {
      return '';
    }

    return (
      this.employee()!.firstName.charAt(0) +
      this.employee()!.lastName.charAt(0)
    ).toUpperCase();

  }


  get statusClass(): string {

    switch (this.employee()!.status) {

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