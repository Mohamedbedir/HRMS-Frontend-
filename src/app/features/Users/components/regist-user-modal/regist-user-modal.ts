import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeListItem } from '../../../employees/models/employee-list.model';
import { EmployeeApiService } from '../../../employees/services/Employee.Service';
import { Roles } from '../../../../core/constants/roles';
import { RegistNewUser } from '../../models/user-response';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-regist-user-modal',
  styleUrl: './regist-user-modal.css',
  templateUrl: './regist-user-modal.html',
})
export class RegistUserModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeApiService);

  @Input() isSubmitting = false;
  @Output() submitted = new EventEmitter<RegistNewUser>();
  @Output() closed = new EventEmitter<void>();

  isLoadingEmployees = false;
  employeeError = '';
  submittedAttempt = false;

  employees=signal<EmployeeListItem[] | null>(null);
  readonly roles = Object.values(Roles);

  readonly form = this.fb.nonNullable.group({
    employeeId: [0, [Validators.required, Validators.min(1)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  loadEmployees(): void {
    this.isLoadingEmployees = true;
    this.employeeError = '';

    this.employeeService.GetAll().subscribe({
      next: (response) => {
        this.isLoadingEmployees = false;
        if (!response.succeeded) {
          this.employeeError = response.message || response.errors?.[0] || 'Could not load employees.';
          return;
        }
        this.employees.set(response.data ?? []);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to load employees for user registration.', error);
        this.isLoadingEmployees = false;
        this.employeeError = this.getErrorMessage(error, 'Failed to load employees.');
      },
    });
  }

  onEmployeeChange(employeeId: number): void {
    const employee = this.employees()?.find((item) => item.id === Number(employeeId));
    this.form.controls.email.setValue(employee?.email ?? '');
  }

  isInvalid(controlName: 'employeeId' | 'email' | 'password' | 'role'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submittedAttempt);
  }

  submit(): void {
    this.submittedAttempt = true;
    if (this.form.invalid || this.isLoadingEmployees || !this.employees() || this.employees()!.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  close(): void {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  private getErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
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
    return error.message || fallbackMessage;
  }
}
