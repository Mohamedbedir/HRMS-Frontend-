import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { forkJoin } from 'rxjs';
import { DepartmentResponse } from '../../../../departments/models/department-response';
import { DepartmentService } from '../../../../departments/services/department.service';
import { PositionResponse } from '../../../../positions/models/Position-response';
import { PositionService } from '../../../../positions/services/position.service';
import { JobPostingResponse } from '../../models/job-postings-response';
import { JobPostingService } from '../../services/jobposting.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-edit-job-postings-modal',
  styleUrl: './edit-job-postings-modal.css',
  templateUrl: './edit-job-postings-modal.html',
})
export class EditJobPostingsModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly positionService = inject(PositionService);
  private readonly jobPostingService = inject(JobPostingService);
  private readonly toastr = inject(ToastrService);

  @Input({ required: true }) jobPosting!: JobPostingResponse;
  @Output() jobPostingUpdated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly departments: DepartmentResponse[] = [];
  readonly positions: PositionResponse[] = [];
  departmentSearch = '';
  positionSearch = '';
  openDropdown: 'department' | 'position' | null = null;
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
          this.toastr.error('Departments and positions could not be loaded.', 'Unable to update posting');
          return;
        }
        this.departments.push(...result.departments.data);
        this.positions.push(...result.positions.data);
        this.form.patchValue({
          title: this.jobPosting.title,
          description: this.jobPosting.description,
          minSalary: this.jobPosting.minSalary,
          maxSalary: this.jobPosting.maxSalary,
          closingDate: this.jobPosting.closingDate ? this.jobPosting.closingDate.slice(0, 10) : '',
          departmentId: this.jobPosting.departmentId ??
            this.departments.find(item => item.name === this.jobPosting.departmentName)?.id ?? 0,
          positionId: this.jobPosting.positionId ??
            this.positions.find(item => item.title === this.jobPosting.positionName)?.id ?? 0,
        });
        if (!this.departments.length || !this.positions.length) {
          this.optionsError = true;
          this.toastr.error('Departments and positions could not be found.', 'Unable to update posting');
        }
      },
      error: (error: unknown) => {
        console.error('Failed to load departments and positions for job posting edit.', error);
        this.isLoadingOptions = false;
        this.optionsError = true;
        this.toastr.error('Departments and positions could not be loaded. Please try again.', 'Unable to update posting');
      },
    });
  }

  get filteredDepartments(): DepartmentResponse[] {
    const query = this.departmentSearch.trim().toLowerCase();
    return this.departments.filter(item =>
      item.name.toLowerCase().includes(query),
    );
  }

  get filteredPositions(): PositionResponse[] {
    const query = this.positionSearch.trim().toLowerCase();
    return this.positions.filter(item =>
      item.title.toLowerCase().includes(query),
    );
  }

  get selectedDepartmentName(): string {
    return this.departments.find(item => item.id === this.form.controls.departmentId.value)?.name ?? 'Select department';
  }

  get selectedPositionName(): string {
    return this.positions.find(item => item.id === this.form.controls.positionId.value)?.title ?? 'Select position';
  }

  toggleDropdown(dropdown: 'department' | 'position'): void {
    this.openDropdown = this.openDropdown === dropdown ? null : dropdown;
  }

  selectDepartment(id: number): void {
    this.form.controls.departmentId.setValue(id);
    this.departmentSearch = '';
    this.openDropdown = null;
  }

  selectPosition(id: number): void {
    this.form.controls.positionId.setValue(id);
    this.positionSearch = '';
    this.openDropdown = null;
  }

  closeDropdown(): void {
    this.openDropdown = null;
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
      this.toastr.error('Complete all required fields and select a department and position.', 'Invalid form');
      return;
    }
    const value = this.form.getRawValue();
    if (value.maxSalary < value.minSalary) {
      this.toastr.error('Maximum salary must be greater than or equal to minimum salary.', 'Invalid salary range');
      return;
    }

    this.isSubmitting = true;
    this.jobPostingService.EditJobPosting({ id: this.jobPosting.id, ...value }).subscribe({
      next: response => {
        this.isSubmitting = false;
        if (!response.succeeded) {
          this.toastr.error(response.message || response.errors?.[0] || 'The job posting could not be updated.', 'Update failed');
          return;
        }
        this.toastr.success(response.message || 'Job posting updated successfully.', 'Success');
        this.jobPostingUpdated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to update job posting.', error);
        this.isSubmitting = false;
        this.toastr.error(this.getErrorMessage(error), 'Update failed');
      },
    });
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
    return error.message || 'The job posting could not be updated. Please try again.';
  }
}
