import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { PositionResponse } from '../../models/Position-response';
import { PositionService } from '../../services/position.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-position-edit-modal',
  styleUrl: './position-edit-modal.css',
  templateUrl: './position-edit-modal.html',
})
export class PositionEditModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly positionService = inject(PositionService);
  private readonly toastr = inject(ToastrService);

  @Input({ required: true }) position!: PositionResponse;
  @Output() positionUpdated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isSubmitting = false;

  readonly editPositionForm = this.fb.nonNullable.group(
    {
      id: [0, Validators.required],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      minSalary: [0, [Validators.required, Validators.min(10000)]],
      maxSalary: [0, [Validators.required, Validators.max(50000)]],
      isActive: [true, Validators.required],
    },
    { validators: [this.validateSalaryRange] },
  );

  ngOnInit(): void {
    this.editPositionForm.patchValue({
      id: this.position.id,
      title: this.position.title,
      description: this.position.description,
      minSalary: this.position.minSalary,
      maxSalary: this.position.maxSalary,
      isActive: this.position.isActive,
    });
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.editPositionForm.invalid) {
      this.editPositionForm.markAllAsTouched();
      this.toastr.error('Please correct the highlighted fields and try again.', 'Invalid form');
      return;
    }

    this.isSubmitting = true;
    const model = this.editPositionForm.getRawValue();

    this.positionService.Updateposition(this.position.id, model).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (!response.succeeded) {
          this.toastr.error(
            response.message || response.errors?.[0] || 'Failed to update position.',
            'Update failed',
          );
          return;
        }

        this.toastr.success(response.message || 'Position updated successfully.', 'Success');
        this.positionUpdated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to update position.', error);
        this.isSubmitting = false;
        this.toastr.error(this.getErrorMessage(error), 'Update failed');
      },
    });
  }

  close(): void {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  getControlError(
    controlName: 'title' | 'description' | 'minSalary' | 'maxSalary' | 'isActive',
  ): string | null {
    const control = this.editPositionForm.controls[controlName];
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

  isControlValid(
    controlName: 'title' | 'description' | 'minSalary' | 'maxSalary' | 'isActive',
  ): boolean {
    const control = this.editPositionForm.controls[controlName];
    return (control.dirty || control.touched) && control.valid;
  }

  private validateSalaryRange(control: AbstractControl): ValidationErrors | null {
    const minSalary = control.get('minSalary')?.value;
    const maxSalary = control.get('maxSalary')?.value;

    return typeof minSalary === 'number' && typeof maxSalary === 'number' && maxSalary < minSalary
      ? { salaryRange: true }
      : null;
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
          Array.isArray(messages)
            ? messages.filter((message): message is string => typeof message === 'string')
            : [],
        );
        if (validationMessages.length) {
          return validationMessages.join(' ');
        }
      }
    }

    return error.message || 'Failed to update position. Please try again.';
  }
}
