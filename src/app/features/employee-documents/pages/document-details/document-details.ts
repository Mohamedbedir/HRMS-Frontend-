import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { EmployeeDocumentResponse } from '../../models/Emp-Doc-Response';
import { EmployeeDocumentService } from '../../services/employee-doc.service';

@Component({
  imports: [DatePipe],
  selector: 'app-document-details',
  styleUrl: './document-details.css',
  templateUrl: './document-details.html',
})
export class DocumentDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly documentService = inject(EmployeeDocumentService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly document = signal<EmployeeDocumentResponse | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly downloadUrl = signal<string | null>(null);
  readonly imagePreviewUrl = signal<SafeUrl | null>(null);
  readonly pdfPreviewUrl = signal<SafeResourceUrl | null>(null);
  readonly previewType = signal<'image' | 'pdf' | 'unsupported' | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }
    this.loadDocument(id);
  }

  loadDocument(id = Number(this.route.snapshot.paramMap.get('id'))): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);
    this.documentService.getDocumentById(id).subscribe({
      next: response => {
        this.isLoading.set(false);
        if (!response.succeeded || !response.data) {
          this.hasError.set(true);
          return;
        }
        this.document.set(response.data);
        this.prepareFilePreview(response.data);
      },
      error: error => {
        console.error('Failed to load document details.', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  goBack(): void {
    const returnPath = this.router.url.startsWith('/admin/')
      ? '/admin/employee-documents'
      : this.router.url.startsWith('/recruiter/')
        ? '/recruiter/employee-documents'
        : '/my-documents';
    this.router.navigateByUrl(returnPath);
  }

  private prepareFilePreview(document: EmployeeDocumentResponse): void {
    this.downloadUrl.set(null);
    this.imagePreviewUrl.set(null);
    this.pdfPreviewUrl.set(null);
    this.previewType.set(null);
    if (!document.file) {
      return;
    }

    try {
      const fileUrl = new URL(document.file, environment.apiUrl);
      const apiOrigin = new URL(environment.apiUrl).origin;
      if (
        !['http:', 'https:'].includes(fileUrl.protocol) ||
        (fileUrl.origin !== apiOrigin && fileUrl.origin !== window.location.origin)
      ) {
        return;
      }

      this.downloadUrl.set(fileUrl.href);
      const extension = (document.fileName || fileUrl.pathname).split('.').pop()?.toLowerCase();
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension ?? '')) {
        this.imagePreviewUrl.set(this.sanitizer.bypassSecurityTrustUrl(fileUrl.href));
        this.previewType.set('image');
      } else if (extension === 'pdf') {
        this.pdfPreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl.href));
        this.previewType.set('pdf');
      } else {
        this.previewType.set('unsupported');
      }
    } catch (error) {
      console.error('Invalid employee document URL.', error);
    }
  }
}
