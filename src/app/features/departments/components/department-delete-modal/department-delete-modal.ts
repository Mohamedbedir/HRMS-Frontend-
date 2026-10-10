import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ToastrService } from '@relynn/ngx-toastr';
import { DepartmentResponse } from '../../models/department-response';
import { DepartmentService } from '../../services/department.service';

@Component({
  imports: [],
  selector: 'app-department-delete-modal',
  styleUrl: './department-delete-modal.css',
  templateUrl: './department-delete-modal.html',
})
export class DepartmentDeleteModal {
  private readonly departmentService = inject(DepartmentService);
  private readonly toastr = inject(ToastrService);

  @Input() department: DepartmentResponse | null = null;
  @Output() deleted = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  isDeleting = false;

  confirmDelete(): void {
    const department = this.department;
    if (!department || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.departmentService.Deletedepartment(department.id).subscribe({
      next: (response) => {
        this.isDeleting = false;
        if (!response.succeeded) {
          this.toastr.error(
            response.message || response.errors?.[0] || 'The department could not be deleted.',
            'Delete failed',
          );
          return;
        }

        this.toastr.success(response.message || 'Department deleted successfully.', 'Success');
        this.deleted.emit(department.id);
      },
      error: (error: unknown) => {
        this.isDeleting = false;
        console.error('Failed to delete department.', error);
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

      return error.message || 'The department could not be deleted.';
    }

    return 'The department could not be deleted.';
  }
}
