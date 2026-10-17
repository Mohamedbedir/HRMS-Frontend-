import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { LeaveApproveModal } from '../../components/leave-approve-modal/leave-approve-modal';
import { LeaveCancelModal } from '../../components/leave-cancel-modal/leave-cancel-modal';
import { LeaveRejectModal } from '../../components/leave-reject-modal/leave-reject-modal';
import { LeaveRequest } from '../../models/leave-request.model';
import { LeaveRequestService } from '../../services/leave-request.service';

type LeaveAction = 'approve' | 'cancel' | 'reject';

@Component({
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    LeaveApproveModal,
    LeaveCancelModal,
    LeaveRejectModal,
  ],
  selector: 'app-leave-request-details',
  styleUrl: './leave-request-details.css',
  templateUrl: './leave-request-details.html',
})
export class LeaveRequestDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly leaveRequestService = inject(LeaveRequestService);
  private readonly toastr = inject(ToastrService);

  readonly request = signal<LeaveRequest | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly actionLoading = signal(false);
  readonly activeAction = signal<LeaveAction | null>(null);

  requestId: number | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.requestId = id;
    this.loadRequest(id);
  }

  retry(): void {
    if (this.requestId !== null) {
      this.loadRequest(this.requestId);
    }
  }

  goBack(): void {
    void this.router.navigate(['/admin/leave-requests']);
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

  openAction(action: LeaveAction): void {
    this.activeAction.set(action);
  }

  closeAction(): void {
    if (!this.actionLoading()) {
      this.activeAction.set(null);
    }
  }

  approveRequest(): void {
    this.runAction('approve', (request) =>
      this.leaveRequestService.approve({ leaveRequestId: request.id }),
    );
  }

  rejectRequest(rejectionReason: string): void {
    this.runAction('reject', (request) =>
      this.leaveRequestService.reject({
        leaveRequestId: request.id,
        rejectionReason,
      }),
    );
  }

  cancelRequest(): void {
    this.runAction('cancel', (request) =>
      this.leaveRequestService.cancel({ leaveRequestId: request.id }),
    );
  }

  private loadRequest(id: number): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.leaveRequestService.getById(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        if (!response.succeeded || !response.data) {
          console.error('Failed to load leave request details.', response.message);
          this.request.set(null);
          this.hasError.set(true);
          return;
        }

        this.request.set(response.data);
      },
      error: (error: unknown) => {
        console.error('Failed to load leave request details.', error);
        this.isLoading.set(false);
        this.request.set(null);
        this.hasError.set(true);
      },
    });
  }

  private runAction(
    action: LeaveAction,
    execute: (request: LeaveRequest) => ReturnType<LeaveRequestService['approve']>,
  ): void {
    const request = this.request();
    if (!request || this.actionLoading()) return;

    this.actionLoading.set(true);
    execute(request).subscribe({
      next: (response) => {
        this.actionLoading.set(false);

        if (!response.succeeded) {
          this.toastr.error(response.message || `Failed to ${action} the request.`, 'Action failed');
          return;
        }

        const actionLabel = {
          approve: 'approved',
          cancel: 'cancelled',
          reject: 'rejected',
        }[action];
        this.toastr.success(`Leave request ${actionLabel} successfully.`, 'Success');
        this.closeAction();
        this.loadRequest(request.id);
      },
      error: (error: { error?: { message?: string } }) => {
        this.actionLoading.set(false);
        this.toastr.error(error?.error?.message || `Failed to ${action} the request.`, 'Action failed');
      },
    });
  }
}
