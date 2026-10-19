import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeDocumentService } from '../../services/employee-doc.service';

@Component({
  imports: [FormsModule],
  selector: 'app-upload-document-modal',
  styleUrl: './upload-document-modal.css',
  templateUrl: './upload-document-modal.html',
})
export class UploadDocumentModal {
  private readonly documentService = inject(EmployeeDocumentService);

  @Input({ required: true }) employeeId!: number;
  @Output() closed = new EventEmitter<void>();
  @Output() uploaded = new EventEmitter<void>();

  documentType = '';
  expiryDate = '';
  selectedFile: File | null = null;
  isSaving = false;
  errorMessage: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit(): void {
    if (!this.documentType.trim() || !this.selectedFile || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.documentService.UploadDocument({
      employeeId: this.employeeId,
      documentType: this.documentType.trim(),
      file: this.selectedFile,
      expiryDate: this.expiryDate,
    }).subscribe({
      next: response => {
        this.isSaving = false;
        if (!response.succeeded) {
          this.errorMessage = response.message || 'The document could not be uploaded.';
          return;
        }
        this.uploaded.emit();
      },
      error: error => {
        console.error('Failed to upload employee document.', error);
        this.isSaving = false;
        this.errorMessage = 'The document could not be uploaded. Please try again.';
      },
    });
  }
}
