import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { CandidateService } from '../../services/candidates.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-add-candidate-modal',
  styleUrl: './add-candidate-modal.css',
  templateUrl: './add-candidate-modal.html',
})
export class AddCandidateModal {
  private readonly fb = inject(FormBuilder);
  private readonly candidateService = inject(CandidateService);
  private readonly toastr = inject(ToastrService);

  @Output() candidateCreated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isSubmitting = false;
  selectedCv: File | null = null;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
  });

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedCv = input.files?.[0] ?? null;
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }
    if (this.form.invalid || !this.selectedCv) {
      this.form.markAllAsTouched();
      if (!this.selectedCv) {
        this.toastr.error('Please attach the candidate CV.', 'CV required');
      } else {
        this.toastr.error('Please correct the highlighted fields and try again.', 'Invalid form');
      }
      return;
    }

    this.isSubmitting = true;
    this.candidateService.createCandidate({
      ...this.form.getRawValue(),
      cv: this.selectedCv,
    }).subscribe({
      next: response => {
        this.isSubmitting = false;
        if (!response.succeeded) {
          this.toastr.error(response.message || response.errors?.[0] || 'The candidate could not be created.', 'Creation failed');
          return;
        }
        this.toastr.success(response.message || 'Candidate created successfully.', 'Success');
        this.candidateCreated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to create candidate.', error);
        this.isSubmitting = false;
        this.toastr.error(this.getErrorMessage(error), 'Creation failed');
      },
    });
  }

  getControlError(controlName: 'firstName' | 'lastName' | 'email' | 'phone'): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.hasError('required')) {
      return 'This field is required.';
    }
    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }
    if (control.hasError('maxlength')) {
      return 'This value is too long.';
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
    return error.message || 'The candidate could not be created. Please try again.';
  }
}
