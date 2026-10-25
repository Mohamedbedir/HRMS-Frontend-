import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangePassword, UserResponse } from '../../models/user-response';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-change-password-modal',
  styleUrl: './change-password-modal.css',
  templateUrl: './change-password-modal.html',
})
export class ChangePasswordModal {
  private readonly fb = inject(FormBuilder);

  @Input({ required: true }) user!: UserResponse;
  @Input() isLoading = false;
  @Output() submitted = new EventEmitter<ChangePassword>();
  @Output() closed = new EventEmitter<void>();

  submittedAttempt = false;

  readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: (control) =>
        control.get('newPassword')?.value === control.get('confirmPassword')?.value
          ? null
          : { passwordMismatch: true },
    },
  );

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    if (!this.isLoading) {
      this.closed.emit();
    }
  }

  isInvalid(controlName: 'newPassword' | 'confirmPassword'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submittedAttempt);
  }

  submit(): void {
    this.submittedAttempt = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.form.getRawValue();
    this.submitted.emit({
      id: this.user.id,
      newPassword,
      confirmPassword,
    });
  }
}

