import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { PositionService } from '../../services/position.service';
import { ToastrService } from '@relynn/ngx-toastr';
import { PositionResponse } from '../../models/Position-response';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [],
  selector: 'app-position-delete-modal',
  styleUrl: './position-delete-modal.css',
  templateUrl: './position-delete-modal.html',
})
export class PositionDeleteModal {
  private readonly positionService = inject(PositionService);
  private readonly toastr = inject(ToastrService);

  @Input() position: PositionResponse | null = null;
  @Output() deleted = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  isDeleting = false;

  close(): void {
    if (!this.isDeleting) {
      this.closed.emit();
    }
  }

  confirmDelete(): void {
    const position = this.position;
    if (!position || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.positionService.Deletepostion(position.id).subscribe({
      next: (response) => {
        this.isDeleting = false;
        if (!response.succeeded) {
          this.toastr.error(
            response.message || response.errors?.[0] || 'The position could not be deleted.',
            'Delete failed',
          );
          return;
        }

        this.toastr.success(response.message || 'position deleted successfully.', 'Success');
        this.deleted.emit(position.id);
      },
      error: (error: unknown) => {
        this.isDeleting = false;
        console.error('Failed to delete position.', error);
        this.toastr.error(this.getErrorMessage(error), 'Delete failed');
      },
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
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

      return error.message || 'The position could not be deleted.';
    }

    return 'The position could not be deleted.';
  }
}
