import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ToastrService } from '@relynn/ngx-toastr';
import { JobPostingResponse } from '../../models/job-postings-response';
import { JobPostingService } from '../../services/jobposting.service';

@Component({
  imports: [],
  selector: 'app-delete-job-postings-modal',
  styleUrl: './delete-job-postings-modal.css',
  templateUrl: './delete-job-postings-modal.html',
})
export class DeleteJobPostingsModal {
  private readonly jobPostingService = inject(JobPostingService);
  private readonly toastr = inject(ToastrService);

  @Input({ required: true }) jobPosting!: JobPostingResponse;
  @Output() deleted = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  isDeleting = false;

  confirmDelete(): void {
    if (this.isDeleting) {
      return;
    }
    this.isDeleting = true;
    this.jobPostingService.DeleteJobPosting(this.jobPosting.id).subscribe({
      next: response => {
        this.isDeleting = false;
        if (!response.succeeded) {
          this.toastr.error(response.message || response.errors?.[0] || 'The job posting could not be deleted.', 'Delete failed');
          return;
        }
        this.toastr.success(response.message || 'Job posting deleted successfully.', 'Success');
        this.deleted.emit(this.jobPosting.id);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to delete job posting.', error);
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
    return error.message || 'The job posting could not be deleted. Please try again.';
  }
}
