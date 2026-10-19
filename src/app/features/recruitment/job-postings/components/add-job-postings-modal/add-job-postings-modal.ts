import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from '@relynn/ngx-toastr';
import { DepartmentResponse } from '../../../../departments/models/department-response';
import { DepartmentService } from '../../../../departments/services/department.service';
import { PositionResponse } from '../../../../positions/models/Position-response';
import { PositionService } from '../../../../positions/services/position.service';
import { JobPostingService } from '../../services/jobposting.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-add-job-postings-modal',
  styleUrl: './add-job-postings-modal.css',
  templateUrl: './add-job-postings-modal.html',
})
export class AddJobPostingsModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly positionService = inject(PositionService);
  private readonly jobPostingService = inject(JobPostingService);
  private readonly toastr = inject(ToastrService);

  @Output() jobPostingCreated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly departments: DepartmentResponse[] = [];
  readonly positions: PositionResponse[] = [];
  departmentSearch = '';
  positionSearch = '';
  isLoadingOptions = true;
  optionsError = false;
  isSubmitting = false;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(5000)]],
    minSalary: [0, [Validators.required, Validators.min(0)]],
    maxSalary: [0, [Validators.required, Validators.min(0)]],
    closingDate: ['', Validators.required],
    departmentId: [0, [Validators.required, Validators.min(1)]],
    positionId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    forkJoin({
      departments: this.departmentService.GetAll(),
      positions: this.positionService.GetAll(),
    }).subscribe({
      next: result => {
        this.isLoadingOptions = false;
        if (!result.departments.succeeded || !Array.isArray(result.departments.data) ||
            !result.positions.succeeded || !Array.isArray(result.positions.data)) {
          this.optionsError = true;
          this.toastr.error('Departments and positions could not be loaded.', 'Unable to create posting');
          return;
        }
        this.departments.push(...result.departments.data.filter(item => item.isActive));
        this.positions.push(...result.positions.data.filter(item => item.isActive));
        if (!this.departments.length || !this.positions.length) {
          this.optionsError = true;
          this.toastr.error('Create an active department and position before adding a job posting.', 'Options unavailable');
        }
      },
      error: (error: unknown) => {
        console.error('Failed to load departments and positions for job posting.', error);
        this.isLoadingOptions = false;
        this.optionsError = true;
        this.toastr.error('Departments and positions could not be loaded. Please try again.', 'Unable to create posting');
      },
    });
  }

  get filteredDepartments(): DepartmentResponse[] {
    const query = this.departmentSearch.trim().toLowerCase();
    const selectedId = this.form.controls.departmentId.value;
    return this.departments.filter(department =>
      department.id === selectedId || department.name.toLowerCase().includes(query),
    );
  }

  get filteredPositions(): PositionResponse[] {
    const query = this.positionSearch.trim().toLowerCase();
    const selectedId = this.form.controls.positionId.value;
    return this.positions.filter(position =>
      position.id === selectedId || position.title.toLowerCase().includes(query),
    );
  }

  onDepartmentSearch(event: Event): void {
    this.departmentSearch = (event.target as HTMLInputElement).value;
  }

  onPositionSearch(event: Event): void {
    this.positionSearch = (event.target as HTMLInputElement).value;
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }
    if (this.form.invalid || this.optionsError) {
      this.form.markAllAsTouched();
      this.toastr.error('Complete all required fields and select an active department and position.', 'Invalid form');
      return;
    }
    const value = this.form.getRawValue();
    if (value.maxSalary < value.minSalary) {
      this.toastr.error('Maximum salary must be greater than or equal to minimum salary.', 'Invalid salary range');
      return;
    }

    this.isSubmitting = true;
    this.jobPostingService.createJobPosting(value).subscribe({
      next: response => {
        this.isSubmitting = false;
        if (!response.succeeded) {
          this.toastr.error(response.message || response.errors?.[0] || 'The job posting could not be created.', 'Creation failed');
          return;
        }
        this.toastr.success(response.message || 'Job posting created successfully.', 'Success');
        this.jobPostingCreated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to create job posting.', error);
        this.isSubmitting = false;
        this.toastr.error(this.getErrorMessage(error), 'Creation failed');
      },
    });
  }

  getControlError(controlName: 'title' | 'description' | 'closingDate' | 'departmentId' | 'positionId' | 'minSalary' | 'maxSalary'): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.hasError('required')) {
      return 'This field is required.';
    }
    if (control.hasError('min')) {
      return controlName === 'departmentId' || controlName === 'positionId'
        ? 'Please choose an option.'
        : 'Enter a non-negative amount.';
    }
    if (control.hasError('maxlength')) {
      return 'The value is too long.';
    }
    return 'Enter a valid value.';
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const payload: unknown = error.error;
    if (typeof payload === 'object' && payload !== null) {
      const response = payload as { message?: unknown; errors?: unknown };
      if (typeof response.message === 'string' && response.message.trim()) {
        return response.message;
      }
      if (Array.isArray(response.errors) && typeof response.errors[0] === 'string') {
        return response.errors[0];
      }
    }
    return error.message || 'The job posting could not be created. Please try again.';
  }
}
