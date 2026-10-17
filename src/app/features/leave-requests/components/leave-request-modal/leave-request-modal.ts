import { Component, EventEmitter, HostListener, inject, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from '@relynn/ngx-toastr';
import { LeaveTypeService } from '../../../leavetype/services/LeaveType.Service';
import { LeaveTypeResponse } from '../../../leavetype/pages/LeaveType-response';
import { CreateLeaveRequest } from '../../models/leave-request.model';
import { LeaveRequestService } from '../../services/leave-request.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-leave-request-modal',
  styleUrl: './leave-request-modal.css',
  templateUrl: './leave-request-modal.html',
})
export class LeaveRequestModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leaveRequestService = inject(LeaveRequestService);
  private readonly leaveTypeService = inject(LeaveTypeService);
  private readonly toastr = inject(ToastrService);

  @Output() requestCreated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly leaveTypes = signal<LeaveTypeResponse[]>([]);
  readonly loadingLeaveTypes = signal(false);
  readonly submitting = signal(false);
  readonly today = this.toLocalDateString(new Date());
  submitted = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group(
    {
      leaveTypeId: [0, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]],
    },
    {
      validators: (control) => {
        const startDate = control.get('startDate')?.value as string;
        const endDate = control.get('endDate')?.value as string;
        return startDate && endDate && endDate < startDate ? { dateRange: true } : null;
      },
    },
  );

  ngOnInit(): void {
    this.loadLeaveTypes();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  loadLeaveTypes(): void {
    this.loadingLeaveTypes.set(true);
    this.errorMessage = '';

    this.leaveTypeService.getAll().subscribe({
      next: (response) => {
        this.loadingLeaveTypes.set(false);

        if (!response.succeeded) {
          this.errorMessage = response.message || 'Could not load leave types.';
          return;
        }

        this.leaveTypes.set((response.data ?? []).filter((leaveType) => leaveType.isActive));
      },
      error: (error) => {
        this.loadingLeaveTypes.set(false);
        this.errorMessage = error?.error?.message || 'Failed to load leave types.';
      },
    });
  }

  close(): void {
    if (!this.submitting()) {
      this.closed.emit();
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: CreateLeaveRequest = {
      leaveTypeId: value.leaveTypeId,
      startDate: value.startDate,
      endDate: value.endDate,
      reason: value.reason.trim(),
    };

    this.submitting.set(true);
    this.leaveRequestService.create(request).subscribe({
      next: (response) => {
        this.submitting.set(false);

        if (!response.succeeded) {
          this.errorMessage = response.message || 'Failed to create leave request.';
          return;
        }

        this.toastr.success('Leave request submitted successfully.', 'Success');
        this.requestCreated.emit();
      },
      error: (error) => {
        this.submitting.set(false);
        this.errorMessage =
          error?.error?.message || 'An error occurred while creating the leave request.';
      },
    });
  }

  private toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
