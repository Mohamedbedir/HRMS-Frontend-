import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ToastrService } from '@relynn/ngx-toastr';
import { CandidateResponse } from '../../models/candidates-response';
import { CandidateService } from '../../services/candidates.service';

@Component({
  imports: [],
  selector: 'app-delete-candidate-modal',
  styleUrl: './delete-candidate-modal.css',
  templateUrl: './delete-candidate-modal.html',
})
export class DeleteCandidateModal {
  private readonly candidateService = inject(CandidateService);
  private readonly toastr = inject(ToastrService);

  @Input({ required: true }) candidate!: CandidateResponse;
  @Output() deleted = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  isDeleting = false;

  confirmDelete(): void {
    if (this.isDeleting) {
      return;
    }
    this.isDeleting = true;
    this.candidateService.DeleteCandidate(this.candidate.id).subscribe({
      next: response => {
        this.isDeleting = false;
        if (!response.succeeded) {
          this.toastr.error(response.message || response.errors?.[0] || 'The candidate could not be deleted.', 'Delete failed');
          return;
        }
        this.toastr.success(response.message || 'Candidate deleted successfully.', 'Success');
        this.deleted.emit(this.candidate.id);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to delete candidate.', error);
        this.isDeleting = false;
        this.toastr.error(this.getErrorMessage(error), 'Delete failed');
      },
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
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
    return error.message || 'The candidate could not be deleted. Please try again.';
  }
}
