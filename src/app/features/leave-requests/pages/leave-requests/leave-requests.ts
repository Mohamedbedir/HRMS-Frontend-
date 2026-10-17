import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { LeaveApproveModal } from '../../components/leave-approve-modal/leave-approve-modal';
import { LeaveCancelModal } from '../../components/leave-cancel-modal/leave-cancel-modal';
import { LeaveRejectModal } from '../../components/leave-reject-modal/leave-reject-modal';
import { LeaveRequestModal } from '../../components/leave-request-modal/leave-request-modal';
import { LeaveRequest } from '../../models/leave-request.model';
import { LeaveRequestService } from '../../services/leave-request.service';

type LeaveAction = 'approve' | 'cancel' | 'reject';

@Component({
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    RouterLink,
    LeaveApproveModal,
    LeaveCancelModal,
    LeaveRejectModal,
    LeaveRequestModal,
  ],
  selector: 'app-leave-requests',
  styleUrl: './leave-requests.css',
  templateUrl: './leave-requests.html',
})
export class LeaveRequests implements OnInit {
  private readonly leaveRequestService = inject(LeaveRequestService);
  private readonly toastr = inject(ToastrService);

  readonly requests = signal<LeaveRequest[]>([]);
  readonly loading = signal(false);
  readonly actionLoading = signal(false);
  readonly createModalOpen = signal(false);
  readonly activeAction = signal<LeaveAction | null>(null);
  readonly selectedRequest = signal<LeaveRequest | null>(null);

  searchTerm = '';
  statusFilter = 'all';
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.errorMessage = '';

    this.leaveRequestService.getAll().subscribe({
      next: (response) => {
        this.loading.set(false);

        if (!response.succeeded) {
          this.requests.set([]);
          this.errorMessage = response.message || 'Failed to load leave requests.';
          this.toastr.error(this.errorMessage, 'Error');
          return;
        }

        this.requests.set(response.data ?? []);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage = error?.error?.message || 'An error occurred while loading leave requests.';
        this.toastr.error(this.errorMessage, 'Error');
      },
    });
  }

  filteredRequests(): LeaveRequest[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.requests().filter((request) => {
      const matchesStatus =
        this.statusFilter === 'all' || request.status.toLowerCase() === this.statusFilter;
      const matchesSearch =
        !search ||
        [request.employeeName, request.leaveType, request.reason, request.status]
          .some((value) => value?.toLowerCase().includes(search));
      return matchesStatus && matchesSearch;
    });
  }

  countByStatus(status: string): number {
    return this.requests().filter((request) => request.status.toLowerCase() === status).length;
  }

  onRowKeydown(event: KeyboardEvent, request: LeaveRequest): void {
    const target = event.target;

    if (
      target instanceof HTMLElement &&
      target.closest('button, a, input, select, textarea')
    ) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const row = event.currentTarget as HTMLElement;
      row.click();
    }
  }

  openAction(action: LeaveAction, request: LeaveRequest): void {
    this.selectedRequest.set(request);
    this.activeAction.set(action);
  }

  closeAction(): void {
    if (!this.actionLoading()) {
      this.activeAction.set(null);
      this.selectedRequest.set(null);
    }
  }

  approveRequest(): void {
    const request = this.selectedRequest();
    if (!request) return;

    this.actionLoading.set(true);
    this.leaveRequestService.approve({ leaveRequestId: request.id }).subscribe({
      next: (response) => this.handleActionResponse(response, 'approve'),
      error: (error) => this.handleActionError(error, 'Failed to approve the request.'),
    });
  }

  rejectRequest(rejectionReason: string): void {
    const request = this.selectedRequest();
    if (!request) return;

    this.actionLoading.set(true);
    this.leaveRequestService.reject({
      leaveRequestId: request.id,
      rejectionReason,
    }).subscribe({
      next: (response) => this.handleActionResponse(response, 'reject'),
      error: (error) => this.handleActionError(error, 'Failed to reject the request.'),
    });
  }

  cancelRequest(): void {
    const request = this.selectedRequest();
    if (!request) return;

    this.actionLoading.set(true);
    this.leaveRequestService.cancel({ leaveRequestId: request.id }).subscribe({
      next: (response) => this.handleActionResponse(response, 'cancel'),
      error: (error) => this.handleActionError(error, 'Failed to cancel the request.'),
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private handleActionResponse(
    response: { succeeded: boolean; message?: string | null },
    action: LeaveAction,
  ): void {
    this.actionLoading.set(false);

    if (!response.succeeded) {
      this.errorMessage = response.message || `Failed to ${action} the request.`;
      this.toastr.error(this.errorMessage, 'Action failed');
      return;
    }

    const actionLabel = {
      approve: 'approved',
      cancel: 'cancelled',
      reject: 'rejected',
    }[action];
    this.successMessage = `Leave request ${actionLabel} successfully.`;
    this.toastr.success(this.successMessage, 'Success');
    this.closeAction();
    this.loadRequests();
  }

  private handleActionError(error: { error?: { message?: string } }, fallback: string): void {
    this.actionLoading.set(false);
    this.errorMessage = error?.error?.message || fallback;
    this.toastr.error(this.errorMessage, 'Action failed');
  }
}
