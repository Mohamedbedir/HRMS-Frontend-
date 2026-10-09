import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { forkJoin } from 'rxjs';
import { DepartmentResponse } from '../../../departments/models/department-response';
import { DepartmentService } from '../../../departments/services/department.service';
import { PositionResponse } from '../../../positions/models/Position-response';
import { PositionService } from '../../../positions/services/position.service';
import { EmployeeDetails } from '../../models/employeedetails';
import { EmployeeListItem } from '../../models/employee-list.model';
import { EmployeeApiService } from '../../services/Employee.Service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-employee-edit',
  styleUrl: './employee-edit.css',
  templateUrl: './employee-edit.html',
})
export class EmployeeEdit implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeApiService = inject(EmployeeApiService);
  private readonly departmentService = inject(DepartmentService);
  private readonly positionService = inject(PositionService);
  private readonly toastr = inject(ToastrService);

  employeeId = 0;
  employeeName = '';
  isLoading = signal(true);
  isSubmitting = signal(false);
  hasLoadError = signal(false);
  departments = signal<DepartmentResponse[]>([]);
  positions = signal<PositionResponse[]>([]);
  managers = signal<EmployeeListItem[]>([]);

  readonly today = this.getTodayDate();

  readonly employeeForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]],
    birthDate: ['', Validators.required],
    hireDate: ['', Validators.required],
    terminationDate: [''],
    salary: [0, [Validators.required, Validators.min(0)]],
    status: ['Active', Validators.required],
    gender: ['Male', Validators.required],
    departmentId: this.fb.control<number | null>(null, Validators.required),
    positionId: this.fb.control<number | null>(null, Validators.required),
    managerId: this.fb.control<number | null>(null),
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.isLoading.set(false);
      this.toastr.error('The employee ID is invalid.', 'Unable to edit employee');
      this.goBack();
      return;
    }

    this.employeeId = id;
    this.loadEmployeeAndLookups();
  }

  private loadEmployeeAndLookups(): void {
    this.isLoading.set(true);
    this.hasLoadError.set(false);
    forkJoin({
      employee: this.employeeApiService.getEmployeeById(this.employeeId),
      departments: this.departmentService.GetAll(),
      positions: this.positionService.GetAll(),
      managers: this.employeeApiService.GetAll(),
    }).subscribe({
      next: result => {
        this.isLoading.set(false);

        const failedResponse = [
          result.employee,
          result.departments,
          result.positions,
          result.managers,
        ].find(response => !response.succeeded);

        if (failedResponse || !result.employee.data) {
          this.hasLoadError.set(true);
          this.toastr.error(
            failedResponse?.message ||
              'Failed to load employee data.',
            'Loading failed'
          );
          return;
        }

        this.departments.set(result.departments.data);
        this.positions.set(result.positions.data);
        this.managers.set(result.managers.data.filter(manager => manager.id !== this.employeeId));
        this.setEmployeeForm(result.employee.data);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to load employee for editing', error);
        this.isLoading.set(false);
        this.hasLoadError.set(true);
        this.toastr.error(
          error.error?.message || error.error?.errors?.[0] || 'Failed to load employee data.',
          'Loading failed'
        );
      },
    });
  }

  retryLoad(): void {
    this.loadEmployeeAndLookups();
  }

  private setEmployeeForm(employee: EmployeeDetails): void {
    this.employeeName = `${employee.firstName} ${employee.lastName}`;
    this.employeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      birthDate: this.toDateInputValue(employee.birthDate),
      hireDate: this.toDateInputValue(employee.hireDate),
      terminationDate: this.toDateInputValue(employee.terminationDate),
      salary: employee.salary,
      status: employee.status,
      gender: employee.gender,
      departmentId: employee.departmentId ??
        this.departments().find(item => this.sameName(item.name, employee.departmentName))?.id ?? null,
      positionId: employee.positionId ??
        this.positions().find(item => this.sameName(item.title, employee.positionTitle))?.id ?? null,
      managerId: employee.managerId ??
        this.managers().find(item =>
          this.sameName(`${item.firstName} ${item.lastName}`, employee.managerName)
        )?.id ?? null,
    });
  }

  submit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.toastr.error('Please correct the highlighted fields and try again.', 'Invalid form');
      return;
    }

    const value = this.employeeForm.getRawValue();
    this.isSubmitting.set(true);

    this.employeeApiService.updateEmployee({
      id: this.employeeId,
      firstName: value.firstName!,
      lastName: value.lastName!,
      email: value.email!,
      phone: value.phone!,
      address: value.address!,
      birthDate: value.birthDate!,
      hireDate: value.hireDate!,
      terminationDate: value.terminationDate ?? '',
      salary: value.salary!,
      status: value.status!,
      gender: value.gender!,
      departmentId: value.departmentId,
      positionId: value.positionId,
      managerId: value.managerId,
    }).subscribe({
      next: response => {
        this.isSubmitting.set(false);
        if (!response.succeeded) {
          this.toastr.error(
            response.message || 'Failed to update employee.',
            'Update failed'
          );
          return;
        }

        this.toastr.success('Employee updated successfully.', 'Success');
        this.router.navigate(['/admin/employees', this.employeeId]);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to update employee', error);
        this.isSubmitting.set(false);
        this.toastr.error(
          error.error?.message || error.error?.errors?.[0] || 'Failed to update employee.',
          'Update failed'
        );
      },
    });
  }

  goBack(): void {
    if (this.employeeId > 0) {
      this.router.navigate(['/admin/employees', this.employeeId]);
      return;
    }
    this.router.navigate(['/admin/employees']);
  }

  controlError(controlName: string): string | null {
    const control = this.employeeForm.get(controlName);
    if (!control?.touched || !control.errors) {
      return null;
    }
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('minlength')) return 'Enter at least 5 characters.';
    if (control.hasError('maxlength')) {
      const limit = controlName === 'firstName' || controlName === 'lastName' ? 100 : 250;
      return `Enter no more than ${limit} characters.`;
    }
    if (control.hasError('pattern')) return 'Enter a valid Egyptian mobile number.';
    if (control.hasError('min')) return 'Salary cannot be negative.';
    return 'Please enter a valid value.';
  }

  isControlValid(controlName: string): boolean {
    const control = this.employeeForm.get(controlName);
    return !!control?.touched && control.valid;
  }

  private sameName(first: string | null | undefined, second: string | null | undefined): boolean {
    return !!first && !!second && first.trim().toLocaleLowerCase() === second.trim().toLocaleLowerCase();
  }

  private toDateInputValue(date: string | null): string {
    return date ? date.slice(0, 10) : '';
  }

  private getTodayDate(): string {
    const today = new Date();
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
