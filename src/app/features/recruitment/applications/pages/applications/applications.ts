import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApplicationResponse } from '../../models/application-respose';
import { ApplicationService } from '../../services/application.service';
import { CreateApplicationModal } from '../../components/create-application-modal/create-application-modal';
import { EditApplicationModal } from '../../components/edit-application-modal/edit-application-modal';
import { DeleteApplicationModal } from '../../components/delete-application-modal/delete-application-modal';

@Component({
  imports: [DatePipe, RouterLink, CreateApplicationModal, EditApplicationModal, DeleteApplicationModal],
  selector: 'app-applications',
  styleUrl: './applications.css',
  templateUrl: './applications.html',
})
export class Applications implements OnInit {
  private readonly applicationService = inject(ApplicationService);

  readonly applications = signal<ApplicationResponse[]>([]);
  readonly filteredApplications = signal<ApplicationResponse[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly searchTerm = signal('');
  readonly statusFilter = signal('All');
  readonly isCreateModalOpen = signal(false);
  readonly applicationToEdit = signal<ApplicationResponse | null>(null);
  readonly applicationToDelete = signal<ApplicationResponse | null>(null);

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.applicationService.getAllApplications().subscribe({
      next: response => {
        this.isLoading.set(false);
        if (!response.succeeded || !Array.isArray(response.data)) {
          this.hasError.set(true);
          return;
        }
        this.applications.set(response.data);
        this.applyFilters();
      },
      error: error => {
        console.error('Failed to load applications.', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilters();
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.applyFilters();
  }

  private applyFilters(): void {
    const query = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    this.filteredApplications.set(
      this.applications().filter(application => {
        const matchesQuery = !query ||
          `${application.candidateName} ${application.jobPostTitle} ${application.notes} ${application.status}`
            .toLowerCase()
            .includes(query);
        return matchesQuery && (status === 'All' || application.status === status);
      }),
    );
  }

  onApplicationCreated(): void {
    this.isCreateModalOpen.set(false);
    this.loadApplications();
  }

  onApplicationUpdated(): void {
    this.applicationToEdit.set(null);
    this.loadApplications();
  }

  onApplicationDeleted(id: number): void {
    this.applications.update(items => items.filter(application => application.id !== id));
    this.applyFilters();
    this.applicationToDelete.set(null);
  }

  statusClass(status: ApplicationResponse['status']): string {
    switch (status) {
      case 'Applied':
        return 'status-applied';
      case 'Screening':
        return 'status-screening';
      case 'Interview':
        return 'status-interview';
      case 'Accepted':
        return 'status-accepted';
      case 'Rejected':
      case 'Withdrawn':
        return 'status-closed';
      default:
        return 'status-default';
    }
  }
}
