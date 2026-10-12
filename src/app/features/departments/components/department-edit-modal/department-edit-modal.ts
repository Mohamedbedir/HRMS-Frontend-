import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { DepartmentResponse } from '../../models/department-response';
import { DepartmentService } from '../../services/department.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-department-edit-modal',
  styleUrl: './department-edit-modal.css',
  templateUrl: './department-edit-modal.html',
})
export class DepartmentEditModal {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly toastr = inject(ToastrService);

  @Input({ required: true }) department!: DepartmentResponse;
  @Output() departmentUpdated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isSubmitting = false;

  readonly editDepartmentForm = this.fb.nonNullable.group({
    id: [0, Validators.required],
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    isActive: [true, Validators.required],
  });

  ngOnInit(): void {
    this.editDepartmentForm.patchValue({
      id: this.department.id,
      name: this.department.name,
      description: this.department.description,
      isActive: this.department.isActive,
    });
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.editDepartmentForm.invalid) {
      this.editDepartmentForm.markAllAsTouched();
      this.toastr.error('Please correct the highlighted fields and try again.', 'Invalid form');
      return;
    }

    this.isSubmitting = true;
    const model = this.editDepartmentForm.getRawValue();

    this.departmentService.UpdateDepartment(this.department.id, model).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (!response.succeeded) {
          this.toastr.error(
            response.message || response.errors?.[0] || 'Failed to update department.',
            'Update failed',
          );
          return;
        }

        this.toastr.success(response.message || 'Department updated successfully.', 'Success');
        this.departmentUpdated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to update department.', error);
        this.isSubmitting = false;
        this.toastr.error(this.getErrorMessage(error), 'Update failed');
      },
    });
  }

  getControlError(controlName: 'name' | 'description' | 'isActive'): string | null {
    const control = this.editDepartmentForm.controls[controlName];
    if (!control.touched || !control.errors) {
      return null;
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }
    if (control.hasError('minlength')) {
      return 'Enter at least 5 characters.';
    }
    if (control.hasError('maxlength')) {
      return controlName === 'name'
        ? 'Department name must not exceed 50 characters.'
        : 'Description must not exceed 500 characters.';
    }

    return 'Enter a valid value.';
  }

  isControlValid(controlName: 'name' | 'description' | 'isActive'): boolean {
    const control = this.editDepartmentForm.controls[controlName];
    return (control.dirty || control.touched) && control.valid;
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
      if (typeof response.errors === 'object' && response.errors !== null) {
        const validationMessages = Object.values(response.errors).flatMap((messages) =>
          Array.isArray(messages) ? messages.filter((message): message is string => typeof message === 'string') : [],
        );
        if (validationMessages.length) {
          return validationMessages.join(' ');
        }
      }
    }

    return error.message || 'Failed to update department. Please try again.';
  }
}
