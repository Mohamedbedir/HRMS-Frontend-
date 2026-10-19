import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeListItem } from '../../../employees/models/employee-list.model';
import { GeneratePayrollRequest } from '../../models/payroll-response';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-payroll-generate-modal',
  styleUrl: './payroll-generate-modal.css',
  templateUrl: './payroll-generate-modal.html',
})
export class PayrollGenerateModal {
  private readonly formBuilder = inject(FormBuilder);

  @Input() employees: EmployeeListItem[] = [];
  @Input() isLoading = false;
  @Output() generated = new EventEmitter<GeneratePayrollRequest>();
  @Output() closed = new EventEmitter<void>();

  readonly currentYear = new Date().getFullYear();
  readonly months = Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: new Date(2000, index, 1).toLocaleString('en', { month: 'long' }),
  }));
  submitted = false;

  readonly form = this.formBuilder.nonNullable.group({
    employeeId: [0, [Validators.required, Validators.min(1)]],
    month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    year: [this.currentYear, [Validators.required, Validators.min(2000), Validators.max(2100)]],
    bonus: [0, [Validators.required, Validators.min(0)]],
    deduction: [0, [Validators.required, Validators.min(0)]],
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    if (!this.isLoading) this.closed.emit();
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.generated.emit({
      employeeId: Number(value.employeeId),
      month: Number(value.month),
      year: Number(value.year),
      bonus: Number(value.bonus),
      deduction: Number(value.deduction),
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted);
  }
}
