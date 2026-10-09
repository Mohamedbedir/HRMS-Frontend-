import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from '@relynn/ngx-toastr';
import { DepartmentService } from '../../../departments/services/department.service';
import { DepartmentResponse } from '../../../departments/models/department-response';
import { PositionService } from '../../../positions/services/position.service';
import { PositionResponse } from '../../../positions/models/Position-response';
import { EmployeeApiService } from '../../services/Employee.Service';
import { EmployeeListItem } from '../../models/employee-list.model';
import { forkJoin, map, Observable } from 'rxjs';

const addressValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const address = typeof control.value === 'string' ? control.value : '';
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    return { required: true };
  }

  if (trimmedAddress.length < 5) {
    return {
      minlength: {
        requiredLength: 5,
        actualLength: trimmedAddress.length,
      },
    };
  }

  if (address.length > 250) {
    return {
      maxlength: {
        requiredLength: 250,
        actualLength: address.length,
      },
    };
  }

  return null;
};

const notFutureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (typeof control.value !== 'string' || !control.value) {
    return null;
  }

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  return control.value > todayString ? { futureDate: true } : null;
};

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-employee-create-modal',
  styleUrl: './employee-create-modal.css',
  templateUrl: './employee-create-modal.html',
})
export class EmployeeCreateModal  implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly employeeApiService = inject(EmployeeApiService);
  private readonly departmentService = inject(DepartmentService);
  private readonly positionService = inject(PositionService);
  private readonly toastr = inject(ToastrService);

  @Output()
  employeeCreated = new EventEmitter<void>();

  @Output()
  closed = new EventEmitter<void>();


  isLoading = false;

  isSubmitting = false;

  hasError = false;


  departments: DepartmentResponse[] = [];

  positions: PositionResponse[] = [];

  managers: EmployeeListItem[] = [];

  readonly today = this.getTodayDate();


  employeeForm = this.fb.group({

    firstName: ['',[Validators.required,Validators.maxLength(100)]],

    lastName: ['',[Validators.required,Validators.maxLength(100)]],

    email: ['',[Validators.required,Validators.email]],

    phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],

    address: ['', addressValidator],

    birthDate: ['',Validators.required],

    hireDate: ['', [Validators.required, notFutureDateValidator]],

    terminationDate: [''],

    salary: [0,[Validators.required,Validators.min(0)]],

    status: ['Active',Validators.required],

    gender: ['Male',Validators.required],

    departmentId: [null as number | null,Validators.required],

    positionId: [null as number | null,Validators.required],

    managerId: [null as number | null]

  });


  ngOnInit(): void {

    this.loadLookups();

  }

  loadDepartments(): Observable<DepartmentResponse[]> {
    return this.departmentService.GetAll().pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message ?? 'Failed to load departments');
        }

        return response.data;
      })
    );
  }

  loadPositions(): Observable<PositionResponse[]> {
    return this.positionService.GetAll().pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message ?? 'Failed to load positions');
        }

        return response.data;
      })
    );
  }

  loadManagers(): Observable<EmployeeListItem[]> {
    return this.employeeApiService.GetAll().pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message ?? 'Failed to load managers');
        }

        return response.data;
      })
    );
  }

  loadLookups(): void {

    this.isLoading = true;

    forkJoin({
      departments:
        this.loadDepartments(),

      positions:
        this.loadPositions(),

      managers:
        this.loadManagers()

    }).subscribe({

      next: result => {

        this.departments =
          result.departments;

        this.positions =
          result.positions;

        this.managers =
          result.managers;

        this.isLoading = false;
        this.changeDetector.markForCheck();

      },

      error: error => {

        console.error(
          'Failed to load employee lookups',
          error
        );

        this.hasError = true;

        this.isLoading = false;
        this.toastr.error(
          error instanceof HttpErrorResponse
            ? error.error?.message ?? 'Failed to load employee data.'
            : error.message ?? 'Failed to load employee data.',
          'Loading failed',
        );
        this.changeDetector.markForCheck();

      }

    });

  }

  submit(): void {

  if (this.employeeForm.invalid) {

    this.employeeForm.markAllAsTouched();
    this.toastr.error('Please correct the highlighted fields and try again.', 'Invalid form');

    return;
  }
  this.isSubmitting = true;
  const value =this.employeeForm.getRawValue();


  this.employeeApiService.createEmployee({

      firstName: value.firstName!,
      lastName: value.lastName!,
      email: value.email!,
      phone: value.phone!,
      address: value.address!,

      birthDate: value.birthDate!,
      hireDate: value.hireDate!,
      terminationDate:
        value.terminationDate ?? '',

      salary: value.salary!,

      status: value.status!,
      gender: value.gender!,

      departmentId:
        value.departmentId,

      positionId:
        value.positionId,

      managerId:
        value.managerId

    })
    .subscribe({

      next: response => {

        this.isSubmitting = false;

        if (!response.succeeded) {
          this.toastr.error(
            response.message || response.errors?.[0] || 'Failed to create employee.',
            'Creation failed',
          );
          return;
        }

        this.employeeCreated.emit();

        this.employeeForm.reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          birthDate: '',
          hireDate: '',
          terminationDate: '',
          salary: 0,
          status: 'Active',
          gender: 'Male',
          departmentId: null,
          positionId: null,
          managerId: null,
        });
        this.toastr.success('Employee created successfully.', 'Success');

      },

      error: (error: HttpErrorResponse) => {

        console.error(
          'Failed to create employee',
          error
        );

        this.isSubmitting = false;
        this.toastr.error(
          error.error?.message ||
            error.error?.errors?.[0] ||
            'Failed to create employee. Please try again.',
          'Creation failed',
        );

      }

    });

  }

  getControlError(controlName: string): string | null {
    const control = this.employeeForm.get(controlName);

    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    if (controlName === 'hireDate' && control.hasError('futureDate')) {
      return 'Hire date cannot be in the future.';
    }

    if (controlName === 'phone' && control.hasError('pattern')) {
      return 'Enter a valid Egyptian mobile number starting with 010, 011, 012, or 015.';
    }

    if (control.hasError('minlength')) {
      return 'Enter at least 5 non-whitespace characters.';
    }

    if (control.hasError('maxlength')) {
      return 'Address must not exceed 250 characters.';
    }

    if (control.hasError('min')) {
      return 'Value must be zero or greater.';
    }

    return 'Enter a valid value.';
  }

  isControlValid(controlName: string): boolean {
    const control = this.employeeForm.get(controlName);
    return !!control && (control.dirty || control.touched) && control.valid;
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