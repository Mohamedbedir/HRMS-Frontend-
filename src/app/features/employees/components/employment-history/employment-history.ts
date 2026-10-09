import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { DateOrFallbackPipe } from '../../../../shared/pipes/date-or-fallback.pipe';
import { EmploymentHistoryModel  } from '../../models/employment-history.model';
import { EmployeeApiService } from '../../services/Employee.Service';

@Component({
  imports: [DatePipe, DateOrFallbackPipe],
  selector: 'app-employment-history',
  styleUrl: './employment-history.css',
  templateUrl: './employment-history.html',
})
export class EmploymentHistory implements OnInit {
  private readonly employeeApiService = inject(EmployeeApiService);

  @Input({ required: true })
  employeeId!: number;

  records = signal<EmploymentHistoryModel[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit(): void {
    this.employeeApiService.getEmploymentHistory(this.employeeId).subscribe({
      next: response => {
        this.isLoading.set(false);

        if (!response.succeeded || !Array.isArray(response.data)) {
          this.hasError.set(true);
          return;
        }

        this.records.set(response.data);
      },
      error: error => {
        console.error('Failed to load employee employment history', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

}
