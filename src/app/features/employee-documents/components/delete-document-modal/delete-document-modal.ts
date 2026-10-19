import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { EmployeeDocumentResponse } from '../../models/Emp-Doc-Response';
import { EmployeeDocumentService } from '../../services/employee-doc.service';

@Component({
  imports: [],
  selector: 'app-delete-document-modal',
  styleUrl: './delete-document-modal.css',
  templateUrl: './delete-document-modal.html',
})
export class DeleteDocumentModal {
  private readonly documentService = inject(EmployeeDocumentService);

  @Input({ required: true }) document!: EmployeeDocumentResponse;
  @Output() closed = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<number>();

  isDeleting = false;
  errorMessage: string | null = null;

  confirmDelete(): void {
    if (this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = null;
    this.documentService.DeleteDocument(this.document.id).subscribe({
      next: response => {
        this.isDeleting = false;
        if (!response.succeeded) {
          this.errorMessage = response.message || 'The document could not be deleted.';
          return;
        }
        this.deleted.emit(this.document.id);
      },
      error: error => {
        console.error('Failed to delete employee document.', error);
        this.isDeleting = false;
        this.errorMessage = 'The document could not be deleted. Please try again.';
      },
    });
  }
}
