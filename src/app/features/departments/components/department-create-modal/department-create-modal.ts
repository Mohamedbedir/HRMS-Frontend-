import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartmentService } from '../../services/department.service';
import { ToastrService } from '@relynn/ngx-toastr';
import { minLength } from '@angular/forms/signals';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-department-create-modal',
  styleUrl: './department-create-modal.css',
  templateUrl: './department-create-modal.html',
})
export class DepartmentCreateModal {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly toastr = inject(ToastrService);

  @Output()
  departmentCreated = new EventEmitter<void>();

  @Output()
  closed = new EventEmitter<void>();

  isLoading =  signal<boolean>(false);
  hasError =  signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  AddDepartmentForm = this.fb.nonNullable.group({
    name: ['', [Validators.required,Validators.minLength(5), Validators.maxLength(50)]],

    description: ['', [Validators.required,Validators.minLength(5),Validators.maxLength(500)]],

    isActive: [true, [Validators.required]],
  });

  submit(): void {
    if (this.AddDepartmentForm.invalid) {
      this.AddDepartmentForm.markAllAsTouched();
      this.toastr.error('Please correct the highlighted fields and try again.', 'Invalid form');

      return;
    }
    this.isSubmitting.set(true);
    const value = this.AddDepartmentForm.getRawValue();

    this.departmentService
      .Createdepartment({
        name: value.name,
        description: value.description,
        isActive: value.isActive,
      })
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);

          if (!response.succeeded) {
            this.toastr.error(
              response.message || response.errors?.[0] || 'Failed to create department.',
              'Creation failed',
            );
            return;
          }

          this.departmentCreated.emit();

          this.AddDepartmentForm.reset({
            name: '',
            description: '',
            isActive: true,
            });
          this.toastr.success('Department created successfully.', 'Success');
        },

        error: (error: HttpErrorResponse) => {
          console.error('Failed to create department', error);

          this.isSubmitting.set(false) ;
          this.toastr.error(
            error.error?.message ||
              error.error?.errors?.[0] ||
              'Failed to create department. Please try again.',
            'Creation failed',
          );
        },
      });
  }

  getControlError(controlName: string): string | null {
    const control = this.AddDepartmentForm.get(controlName);

    if (!control || !control.touched || !control.errors) {
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

    if (control.hasError('min')) {
      return 'Value must be 5 Char or greater.';
    }

    return 'Enter a valid value.';
  }

  isControlValid(controlName: string): boolean {
    const control = this.AddDepartmentForm.get(controlName);
    return !!control && (control.dirty || control.touched) && control.valid;
  }
}
