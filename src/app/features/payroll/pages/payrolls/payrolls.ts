import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { EmployeeApiService } from '../../../employees/services/Employee.Service';
import { EmployeeListItem } from '../../../employees/models/employee-list.model';
import { PayrollResponse, GeneratePayrollRequest } from '../../models/payroll-response';
import { PayrollService } from '../../services/payroll.service';
import { PayrollApproveModal } from '../../components/payroll-approve-modal/payroll-approve-modal';
import { PayrollCancelModal } from '../../components/payroll-cancel-modal/payroll-cancel-modal';
import { PayrollGenerateModal } from '../../components/payroll-generate-modal/payroll-generate-modal';
import { PayrollPayModal } from '../../components/payroll-pay-modal/payroll-pay-modal';

type PayrollAction = 'approve' | 'cancel' | 'pay';

@Component({
  imports: [
    CommonModule,
    CurrencyPipe,
    FormsModule,
    PayrollApproveModal,
    PayrollCancelModal,
    PayrollGenerateModal,
    PayrollPayModal,
  ],
  selector: 'app-payrolls',
  styleUrl: './payrolls.css',
  templateUrl: './payrolls.html',
})
export class Payrolls implements OnInit {
  private readonly payrollService = inject(PayrollService);
  private readonly employeeService = inject(EmployeeApiService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  readonly payrolls = signal<PayrollResponse[]>([]);
  readonly employees = signal<EmployeeListItem[]>([]);
  readonly loading = signal(false);
  readonly actionLoading = signal(false);
  readonly generateModalOpen = signal(false);
  readonly activeAction = signal<PayrollAction | null>(null);
  readonly selectedPayroll = signal<PayrollResponse | null>(null);

  searchTerm = '';
  statusFilter = 'all';
  errorMessage = '';

  ngOnInit(): void {
    this.loadPayrolls();
    this.loadEmployees();
  }

  loadPayrolls(): void {
    this.loading.set(true);
    this.errorMessage = '';

    this.payrollService.getAllPayroll().subscribe({
      next: (response) => {
        this.loading.set(false);
        if (!response.succeeded) {
          this.payrolls.set([]);
          this.errorMessage = response.message || 'Failed to load payrolls.';
          this.toastr.error(this.errorMessage, 'Error');
          return;
        }
        this.payrolls.set(response.data ?? []);
      },
      error: (error: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.errorMessage = error?.error?.message || 'An error occurred while loading payrolls.';
        this.toastr.error(this.errorMessage, 'Error');
      },
    });
  }

  openPayrollDetails(payroll: PayrollResponse): void {
    void this.router.navigate(['/admin/payroll', payroll.id]);
  }

  onRowKeydown(event: KeyboardEvent, payroll: PayrollResponse): void {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('button, a, input, select, textarea')) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openPayrollDetails(payroll);
    }
  }

  filteredPayrolls(): PayrollResponse[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.payrolls().filter((payroll) => {
      const matchesStatus = this.statusFilter === 'all' || payroll.status.toLowerCase() === this.statusFilter;
      const matchesSearch =
        !search ||
        [payroll.employeeName, payroll.status, String(payroll.month), String(payroll.year), String(payroll.id)]
          .some((value) => value?.toLowerCase().includes(search));
      return matchesStatus && matchesSearch;
    });
  }

  countByStatus(status: string): number {
    return this.payrolls().filter((payroll) => payroll.status.toLowerCase() === status.toLowerCase()).length;
  }

  openAction(action: PayrollAction, payroll: PayrollResponse): void {
    this.selectedPayroll.set(payroll);
    this.activeAction.set(action);
  }

  closeAction(): void {
    if (!this.actionLoading()) {
      this.activeAction.set(null);
    }
  }

  generatePayroll(request: GeneratePayrollRequest): void {
    this.actionLoading.set(true);
    this.payrollService.GeneratePayroll(request).subscribe({
      next: (response) => this.handleActionResponse(response, 'generate'),
      error: (error: { error?: { message?: string } }) =>
        this.handleActionError(error, 'Failed to generate payroll.'),
    });
  }

  approvePayroll(): void {
    const payroll = this.selectedPayroll();
    if (!payroll) return;

    this.actionLoading.set(true);
    this.payrollService.approvePayroll({ payrollId: payroll.id }).subscribe({
      next: (response) => this.handleActionResponse(response, 'approve'),
      error: (error: { error?: { message?: string } }) =>
        this.handleActionError(error, 'Failed to approve payroll.'),
    });
  }

  payPayroll(): void {
    const payroll = this.selectedPayroll();
    if (!payroll) return;

    this.actionLoading.set(true);
    this.payrollService.PayPayroll({ payrollId: payroll.id }).subscribe({
      next: (response) => this.handleActionResponse(response, 'pay'),
      error: (error: { error?: { message?: string } }) =>
        this.handleActionError(error, 'Failed to mark payroll as paid.'),
    });
  }

  cancelPayroll(): void {
    const payroll = this.selectedPayroll();
    if (!payroll) return;

    this.actionLoading.set(true);
    this.payrollService.CancelPayroll({ payrollId: payroll.id }).subscribe({
      next: (response) => this.handleActionResponse(response, 'cancel'),
      error: (error: { error?: { message?: string } }) =>
        this.handleActionError(error, 'Failed to cancel payroll.'),
    });
  }

  canApprove(payroll: PayrollResponse): boolean {
    return ['generated', 'calculated'].includes(payroll.status.toLowerCase());
  }

  canPay(payroll: PayrollResponse): boolean {
    return payroll.status.toLowerCase() === 'approved';
  }

  canCancel(payroll: PayrollResponse): boolean {
    return !['paid', 'cancelled'].includes(payroll.status.toLowerCase());
  }

  statusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'approved':
        return 'status-success';
      case 'cancelled':
        return 'status-danger';
      case 'generated':
      case 'calculated':
        return 'status-info';
      default:
        return 'status-warning';
    }
  }

  monthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('en', { month: 'long' });
  }

  private loadEmployees(): void {
    this.employeeService.GetAll().subscribe({
      next: (response) => {
        if (!response.succeeded) {
          this.toastr.error(response.message || 'Could not load employees for payroll generation.', 'Error');
          return;
        }
        this.employees.set(response.data ?? []);
      },
      error: (error: { error?: { message?: string } }) =>
        this.toastr.error(error?.error?.message || 'Failed to load employees for payroll generation.', 'Error'),
    });
  }

  private handleActionResponse(
    response: { succeeded: boolean; message?: string | null },
    action: PayrollAction | 'generate',
  ): void {
    this.actionLoading.set(false);
    if (!response.succeeded) {
      this.toastr.error(response.message || `Failed to ${action} payroll.`, 'Action failed');
      return;
    }

    const labels = {
      generate: 'generated',
      approve: 'approved',
      pay: 'marked as paid',
      cancel: 'cancelled',
    };
    this.toastr.success(`Payroll ${labels[action]} successfully.`, 'Success');
    this.activeAction.set(null);
    if (action === 'generate') {
      this.generateModalOpen.set(false);
    } else {
      this.selectedPayroll.set(null);
    }
    this.loadPayrolls();
  }

  private handleActionError(error: { error?: { message?: string } }, fallback: string): void {
    this.actionLoading.set(false);
    this.toastr.error(error?.error?.message || fallback, 'Action failed');
  }
}
