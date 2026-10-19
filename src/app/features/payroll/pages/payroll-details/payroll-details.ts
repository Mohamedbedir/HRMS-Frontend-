import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { PayrollApproveModal } from '../../components/payroll-approve-modal/payroll-approve-modal';
import { PayrollCancelModal } from '../../components/payroll-cancel-modal/payroll-cancel-modal';
import { PayrollPayModal } from '../../components/payroll-pay-modal/payroll-pay-modal';
import { PayrollDetailsResponse, PayrollItemResponse } from '../../models/payroll-response';
import { PayrollService } from '../../services/payroll.service';

type PayrollAction = 'approve' | 'cancel' | 'pay';

@Component({
  imports: [CommonModule, CurrencyPipe, DatePipe, PayrollApproveModal, PayrollCancelModal, PayrollPayModal],
  selector: 'app-payroll-details',
  styleUrl: './payroll-details.css',
  templateUrl: './payroll-details.html',
})
export class PayrollDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly payrollService = inject(PayrollService);
  private readonly toastr = inject(ToastrService);

  readonly payroll = signal<PayrollDetailsResponse<PayrollItemResponse> | null>(null);
  readonly loading = signal(true);
  readonly actionLoading = signal(false);
  readonly errorMessage = signal('');
  readonly activeAction = signal<PayrollAction | null>(null);

  private payrollId: number | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      this.errorMessage.set('The payroll ID is invalid.');
      return;
    }

    this.payrollId = id;
    this.loadPayroll(id);
  }

  retry(): void {
    if (this.payrollId !== null) this.loadPayroll(this.payrollId);
  }

  goBack(): void {
    void this.router.navigate(['/admin/payroll']);
  }

  get period(): string {
    const payroll = this.payroll();
    if (!payroll) return '';
    return `${this.monthName} ${payroll.year}`;
  }

  get monthName(): string {
    const payroll = this.payroll();
    return payroll
      ? new Date(2000, payroll.month - 1, 1).toLocaleString('en', { month: 'long' })
      : '';
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

  canApprove(payroll: PayrollDetailsResponse<PayrollItemResponse>): boolean {
    return ['generated', 'calculated'].includes(payroll.status.toLowerCase());
  }

  canPay(payroll: PayrollDetailsResponse<PayrollItemResponse>): boolean {
    return payroll.status.toLowerCase() === 'approved';
  }

  canCancel(payroll: PayrollDetailsResponse<PayrollItemResponse>): boolean {
    return !['paid', 'cancelled'].includes(payroll.status.toLowerCase());
  }

  openAction(action: PayrollAction): void {
    this.activeAction.set(action);
  }

  closeAction(): void {
    if (!this.actionLoading()) this.activeAction.set(null);
  }

  confirmAction(): void {
    const payroll = this.payroll();
    const action = this.activeAction();
    if (!payroll || !action) return;

    this.actionLoading.set(true);
    const request = { payrollId: payroll.id };
    const operation =
      action === 'approve'
        ? this.payrollService.approvePayroll(request)
        : action === 'pay'
          ? this.payrollService.PayPayroll(request)
          : this.payrollService.CancelPayroll(request);

    operation.subscribe({
      next: (response) => {
        this.actionLoading.set(false);
        if (!response.succeeded) {
          this.toastr.error(response.message || `Failed to ${action} payroll.`, 'Action failed');
          return;
        }

        const labels = { approve: 'approved', pay: 'marked as paid', cancel: 'cancelled' };
        this.toastr.success(`Payroll ${labels[action]} successfully.`, 'Success');
        this.activeAction.set(null);
        this.loadPayroll(payroll.id);
      },
      error: (error: { error?: { message?: string } }) => {
        this.actionLoading.set(false);
        this.toastr.error(error?.error?.message || `Failed to ${action} payroll.`, 'Action failed');
      },
    });
  }

  getItemTypeLabel(type: string): string {
    return type.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  private loadPayroll(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.payrollService.getPayrollById(id).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (!response.succeeded || !response.data) {
          this.payroll.set(null);
          this.errorMessage.set(response.message || 'Could not load payroll details.');
          return;
        }
        this.payroll.set(response.data);
      },
      error: (error: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.payroll.set(null);
        this.errorMessage.set(error?.error?.message || 'An error occurred while loading payroll details.');
      },
    });
  }
}
