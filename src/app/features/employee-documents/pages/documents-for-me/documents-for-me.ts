import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeDocumentResponse } from '../../models/Emp-Doc-Response';
import { EmployeeDocumentService } from '../../services/employee-doc.service';
import { TokenService } from '../../../../core/services/token.service';
import { UploadDocumentModal } from '../../components/upload-document-modal/upload-document-modal';
import { EditDocumentModal } from '../../components/edit-document-modal/edit-document-modal';
import { DeleteDocumentModal } from '../../components/delete-document-modal/delete-document-modal';

@Component({
  imports: [DatePipe, UploadDocumentModal, EditDocumentModal, DeleteDocumentModal],
  selector: 'app-documents-for-me',
  styleUrl: './documents-for-me.css',
  templateUrl: './documents-for-me.html',
})
export class DocumentsForMe implements OnInit {
  private readonly documentService = inject(EmployeeDocumentService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  readonly employeeId = this.tokenService.getEmployeeId();
  readonly documents = signal<EmployeeDocumentResponse[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly errorMessage = signal('Your documents could not be loaded.');
  readonly notice = signal<string | null>(null);
  readonly isUploadOpen = signal(false);
  readonly documentToEdit = signal<EmployeeDocumentResponse | null>(null);
  readonly documentToDelete = signal<EmployeeDocumentResponse | null>(null);

  ngOnInit(): void {
    if (!Number.isSafeInteger(this.employeeId) || this.employeeId <= 0) {
      this.isLoading.set(false);
      this.hasError.set(true);
      this.errorMessage.set('Your employee profile could not be identified. Please contact HR.');
      return;
    }

    this.loadDocuments();
  }

  loadDocuments(): void {
    if (!Number.isSafeInteger(this.employeeId) || this.employeeId <= 0) {
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.documentService.getDocumentForEmployee(this.employeeId).subscribe({
      next: response => {
        this.isLoading.set(false);
        if (!response.succeeded || !Array.isArray(response.data)) {
          this.hasError.set(true);
          this.errorMessage.set(response.message || 'Your documents could not be loaded.');
          return;
        }
        this.documents.set(response.data);
      },
      error: error => {
        console.error('Failed to load documents for the current employee.', error);
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set('Your documents could not be loaded. Please try again.');
      },
    });
  }

  openUpload(): void {
    this.isUploadOpen.set(true);
  }

  closeUpload(): void {
    this.isUploadOpen.set(false);
  }

  onUploaded(): void {
    this.closeUpload();
    this.notice.set('Document uploaded successfully.');
    this.loadDocuments();
  }

  editDocument(document: EmployeeDocumentResponse): void {
    this.documentToEdit.set(document);
  }

  closeEdit(): void {
    this.documentToEdit.set(null);
  }

  onUpdated(): void {
    this.closeEdit();
    this.notice.set('Document updated successfully.');
    this.loadDocuments();
  }

  deleteDocument(document: EmployeeDocumentResponse): void {
    this.documentToDelete.set(document);
  }

  closeDelete(): void {
    this.documentToDelete.set(null);
  }

  onDeleted(id: number): void {
    this.documents.update(items => items.filter(document => document.id !== id));
    this.closeDelete();
    this.notice.set('Document deleted successfully.');
  }

  clearNotice(): void {
    this.notice.set(null);
  }

  isExpired(expiryDate: string): boolean {
    const timestamp = new Date(expiryDate).getTime();
    return Number.isFinite(timestamp) && timestamp < Date.now();
  }

  openDetails(id: number): void {
    const basePath = this.router.url.startsWith('/admin/')
      ? '/admin/employee-documents'
      : this.router.url.startsWith('/recruiter/')
        ? '/recruiter/employee-documents'
        : '/my-documents';
    this.router.navigate([basePath, id]);
  }
}
