import { DatePipe } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { EmployeeDocumentService } from '../../services/employee-doc.service';
import { EmployeeDocumentResponse } from '../../models/Emp-Doc-Response';

@Component({
  imports: [DatePipe],
  selector: 'app-document-for-employee',
  styleUrl: './document-for-employee.css',
  templateUrl: './document-for-employee.html',
})
export class DocumentForEmployee implements OnInit {
  private readonly documentService = inject(EmployeeDocumentService);

  documents = signal<EmployeeDocumentResponse[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  @Input({ required: true })
  employeeId!: number;

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.documentService.getDocumentForEmployee(this.employeeId).subscribe({
      next: response => {
        this.isLoading.set(false);

        if (!response.succeeded || !Array.isArray(response.data)) {
          this.hasError.set(true);
          return;
        }

        this.documents.set(response.data);
      },
      error: error => {
        console.error('Failed to load employee documents', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  isExpired(expiryDate: string): boolean {
    const expiryTimestamp = new Date(expiryDate).getTime();
    return Number.isFinite(expiryTimestamp) && expiryTimestamp < Date.now();
  }
}
