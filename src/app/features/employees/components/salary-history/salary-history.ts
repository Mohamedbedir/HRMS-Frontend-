import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { DateOrFallbackPipe } from '../../../../shared/pipes/date-or-fallback.pipe';
import { SalaryHistoryModel} from '../../models/salary-history.model';
import { EmployeeApiService } from '../../services/Employee.Service';

@Component({
  imports: [CurrencyPipe, DatePipe, DateOrFallbackPipe],
  selector: 'app-salary-history',
  styleUrl: './salary-history.css',
  templateUrl: './salary-history.html',
})
export class SalaryHistory implements OnInit {
  private readonly employeeApiService = inject(EmployeeApiService);

  @Input({ required: true })
  employeeId!: number;

  records = signal<SalaryHistoryModel []>([]);
  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit(): void {
    this.employeeApiService.getSalaryHistory(this.employeeId).subscribe({
      next: response => {
        this.isLoading.set(false);

        if (!response.succeeded || !Array.isArray(response.data)) {
          this.hasError.set(true);
          return;
        }

        this.records.set(response.data);

      },
      error: error => {
        console.error('Failed to load employee salary history', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

}
