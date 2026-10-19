import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeDocumentResponse } from '../../models/Emp-Doc-Response';
import { EmployeeDocumentService } from '../../services/employee-doc.service';

@Component({
  imports: [FormsModule],
  selector: 'app-edit-document-modal',
  styleUrl: './edit-document-modal.css',
  templateUrl: './edit-document-modal.html',
})
export class EditDocumentModal implements OnChanges {
  private readonly documentService = inject(EmployeeDocumentService);

  @Input({ required: true }) document!: EmployeeDocumentResponse;
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  documentType = '';
  expiryDate = '';
  selectedFile: File | null = null;
  isSaving = false;
  errorMessage: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document'] && this.document) {
      this.documentType = this.document.documentType ?? '';
      this.expiryDate = this.document.expiryDate ? this.document.expiryDate.slice(0, 10) : '';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit(): void {
    if (!this.documentType.trim() || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.documentService.EditDocument({
      id: this.document.id,
      documentType: this.documentType.trim(),
      file: this.selectedFile,
      expiryDate: this.expiryDate,
    }).subscribe({
      next: response => {
        this.isSaving = false;
        if (!response.succeeded) {
          this.errorMessage = response.message || 'The document could not be updated.';
          return;
        }
        this.updated.emit();
      },
      error: error => {
        console.error('Failed to update employee document.', error);
        this.isSaving = false;
        this.errorMessage = 'The document could not be updated. Please try again.';
      },
    });
  }
}
