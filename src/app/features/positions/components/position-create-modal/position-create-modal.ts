import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { PositionService } from '../../services/position.service';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-position-create-modal',
  styleUrl: './position-create-modal.css',
  templateUrl: './position-create-modal.html',
})
export class PositionCreateModal {
  private readonly positionService = inject(PositionService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  @Output()
  positionCreated = new EventEmitter<void>();

  @Output()
  closed = new EventEmitter<void>();

  isLoading = signal<boolean>(false);
  hasError = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  AddpositionForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    minSalary: [0, [Validators.required, Validators.min(10000)]],
    maxSalary: [0, [Validators.required, Validators.max(50000)]],
    isActive: [true, [Validators.required]],
  }, {
    validators: [this.validateSalaryRange],
  });

  submit(): void {
    if (this.AddpositionForm.invalid) {
      this.AddpositionForm.markAllAsTouched();
      this.toastr.error('Please correct the highlighted fields and try again.', 'Invalid form');

      return;
    }
    this.isSubmitting.set(true);
    const value = this.AddpositionForm.getRawValue();

    this.positionService
      .Createposition({
        title: value.title,
        description: value.description,
        minSalary:value.minSalary,
        maxSalary:value.maxSalary,
        isActive: value.isActive,
      })
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);

          if (!response.succeeded) {
            this.toastr.error(
              response.message || response.errors?.[0] || 'Failed to create position.',
              'Creation failed',
            );
            return;
          }

          this.positionCreated.emit();

          this.AddpositionForm.reset({
            title: '',
            description: '',
            minSalary:0,
            maxSalary:0,
            isActive: true,
            });
          this.toastr.success('position created successfully.', 'Success');
        },

        error: (error: HttpErrorResponse) => {
          console.error('Failed to create position', error);

          this.isSubmitting.set(false) ;
          this.toastr.error(
            error.error?.message ||
              error.error?.errors?.[0] ||
              'Failed to create position. Please try again.',
            'Creation failed',
          );
        },
      });
  }

  getControlError(controlName: string): string | null {
    const control = this.AddpositionForm.get(controlName);

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
      return controlName === 'title'
        ? 'Position title must not exceed 50 characters.'
        : 'Description must not exceed 500 characters.';
    }

    if (control.hasError('min')) {
      return 'Minimum salary must be at least 10,000.';
    }
    if (control.hasError('max')) {
      return 'Maximum salary must be 50,000 or less.';
    }

    return 'Enter a valid value.';
  }

  isControlValid(controlName: string): boolean {
    const control = this.AddpositionForm.get(controlName);
    return !!control && (control.dirty || control.touched) && control.valid;
  }

  close(): void {
    if (!this.isSubmitting()) {
      this.closed.emit();
    }
  }

  private validateSalaryRange(control: AbstractControl): ValidationErrors | null {
    const minSalary = control.get('minSalary')?.value;
    const maxSalary = control.get('maxSalary')?.value;

    return typeof minSalary === 'number' && typeof maxSalary === 'number' && maxSalary < minSalary
      ? { salaryRange: true }
      : null;
  }
}
