import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, HostListener, inject, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { TokenService } from '../../../../core/services/token.service';
import { EmployeeListItem } from '../../../employees/models/employee-list.model';
import { EmployeeApiService } from '../../../employees/services/Employee.Service';
import { CreatePerformanceReviewRequest } from '../../models/performance-review.model';
import { PerformanceReviewService } from '../../services/performance-review.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-performance-review-create-modal',
  styleUrl: './performance-review-create-modal.css',
  templateUrl: './performance-review-create-modal.html',
})
export class PerformanceReviewCreateModal implements OnInit {
  private readonly employeeService = inject(EmployeeApiService);
  private readonly tokenService = inject(TokenService);
  private readonly fb = inject(FormBuilder);
  private readonly reviewService = inject(PerformanceReviewService);
  private readonly toastr = inject(ToastrService);

  @Output() reviewCreated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly employees = signal<EmployeeListItem[]>([]);
  readonly loadingEmployees = signal(false);
  readonly employeeLoadError = signal('');
  readonly submitting = signal(false);

  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  readonly form = this.fb.nonNullable.group({
    employeeId: [0, [Validators.required, Validators.min(1)]],
    month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    year: [
      new Date().getFullYear(),
      [Validators.required, Validators.min(2000), Validators.max(2100)],
    ],
    score: [5, [Validators.required, Validators.min(0), Validators.max(5)]],
    comments: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Please correct the highlighted fields and try again.', 'Invalid form');
      return;
    }

    this.submitting.set(true);
    const value = this.form.getRawValue();
    const request: CreatePerformanceReviewRequest = {
      employeeId: value.employeeId,
      month: value.month,
      year: value.year,
      score: value.score,
      comments: value.comments.trim(),
    };

    this.reviewService.create(request).subscribe({
      next: (response) => {
        this.submitting.set(false);

        if (!response.succeeded) {
          this.toastr.error(
            response.message || response.errors?.[0] || 'Failed to create performance review.',
            'Creation failed',
          );
          return;
        }

        this.toastr.success('Performance review created successfully.', 'Success');
        this.reviewCreated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to create performance review.', error);
        this.submitting.set(false);
        this.toastr.error(
          error.error?.message ||
            error.error?.errors?.[0] ||
            'Failed to create performance review. Please try again.',
          'Creation failed',
        );
      },
    });
  }

  getControlError(controlName: string): string | null {
    const control = this.form.get(controlName);

    if (!control?.touched || !control.errors) {
      return null;
    }

    if (control.hasError('required') || control.hasError('min')) {
      if (controlName === 'employeeId') {
        return 'Select an employee.';
      }
      if (controlName === 'score') {
        return 'Score must be between 0 and 5.';
      }
      if (controlName === 'month') {
        return 'Select a valid review month.';
      }
      if (controlName === 'year') {
        return 'Enter a year between 2000 and 2100.';
      }
      return 'This field is required.';
    }

    if (control.hasError('max')) {
      if (controlName === 'score') {
        return 'Score must be between 0 and 5.';
      }
      if (controlName === 'month') {
        return 'Select a valid review month.';
      }
      return 'Enter a year between 2000 and 2100.';
    }

    if (control.hasError('maxlength')) {
      return 'Comments must not exceed 1,000 characters.';
    }

    if (control.hasError('pattern')) {
      return 'Comments cannot be blank.';
    }

    return 'Enter a valid value.';
  }

  isControlValid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && (control.dirty || control.touched) && control.valid;
  }

  close(): void {
    if (!this.submitting()) {
      this.closed.emit();
    }
  }

  private loadEmployees(): void {
    const currentEmployeeId = this.tokenService.getEmployeeId();

    if (currentEmployeeId === null) {
      this.employeeLoadError.set('Unable to identify your employee account. Please sign in again.');
      this.toastr.error(this.employeeLoadError(), 'Unable to load employees');
      return;
    }

    this.loadingEmployees.set(true);
    this.employeeLoadError.set('');

    this.employeeService.GetAll().subscribe({
      next: (response) => {
        this.loadingEmployees.set(false);

        if (!response.succeeded || !response.data) {
          this.employeeLoadError.set(
            response.message || response.errors?.[0] || 'Unable to load employees.',
          );
          this.toastr.error(this.employeeLoadError(), 'Unable to load employees');
          return;
        }

        this.employees.set(
          response.data.filter((employee) => employee.managerId === currentEmployeeId),          
        );
        console.log(currentEmployeeId)
        console.log(response.data)

      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to load employees for performance review.', error);
        this.loadingEmployees.set(false);
        this.employeeLoadError.set(
          error.error?.message ||
            error.error?.errors?.[0] ||
            'Unable to load employees. Please try again.',
        );
        this.toastr.error(this.employeeLoadError(), 'Unable to load employees');
      },
    });
  }
}
