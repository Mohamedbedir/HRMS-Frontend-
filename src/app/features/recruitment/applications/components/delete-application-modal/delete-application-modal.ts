import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ToastrService } from '@relynn/ngx-toastr';
import { ApplicationResponse } from '../../models/application-respose';
import { ApplicationService } from '../../services/application.service';

@Component({
  imports: [],
  selector: 'app-delete-application-modal',
  styleUrl: './delete-application-modal.css',
  templateUrl: './delete-application-modal.html',
})
export class DeleteApplicationModal {
  private readonly applicationService = inject(ApplicationService);
  private readonly toastr = inject(ToastrService);

  @Input({ required: true }) application!: ApplicationResponse;
  @Output() deleted = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  isDeleting = false;

  confirmDelete(): void {
    if (this.isDeleting) {
      return;
    }
    this.isDeleting = true;
    this.applicationService.DeleteApplication(this.application.id).subscribe({
      next: response => {
        this.isDeleting = false;
        if (!response.succeeded) {
          this.toastr.error(response.message || response.errors?.[0] || 'The application could not be deleted.', 'Delete failed');
          return;
        }
        this.toastr.success(response.message || 'Application deleted successfully.', 'Success');
        this.deleted.emit(this.application.id);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to delete application.', error);
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
    return error.message || 'The application could not be deleted. Please try again.';
  }
}
