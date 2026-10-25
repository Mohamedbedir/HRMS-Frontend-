import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { ApplicationResponse } from '../../models/application-respose';
import { ApplicationService } from '../../services/application.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-edit-application-modal',
  styleUrl: './edit-application-modal.css',
  templateUrl: './edit-application-modal.html',
})
export class EditApplicationModal {
  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(ApplicationService);
  private readonly toastr = inject(ToastrService);

  @Input({ required: true }) application!: ApplicationResponse;
  @Output() applicationUpdated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isSubmitting = false;

  readonly form = this.fb.nonNullable.group({
    notes: ['', Validators.maxLength(2000)],
  });

  ngOnInit(): void {
    this.form.patchValue({ notes: this.application.notes ?? '' });
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.applicationService.EditApplication({
      id: this.application.id,
      notes: this.form.controls.notes.value,
    }).subscribe({
      next: response => {
        this.isSubmitting = false;
        if (!response.succeeded) {
          this.toastr.error(response.message || response.errors?.[0] || 'The application could not be updated.', 'Update failed');
          return;
        }
        this.toastr.success(response.message || 'Application updated successfully.', 'Success');
        this.applicationUpdated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to update application.', error);
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
    return error.message || 'The application could not be updated. Please try again.';
  }
}
