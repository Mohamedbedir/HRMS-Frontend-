import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JobPostingResponse } from '../../models/job-postings-response';
import { JobPostingService } from '../../services/jobposting.service';
import { AddJobPostingsModal } from '../../components/add-job-postings-modal/add-job-postings-modal';
import { EditJobPostingsModal } from '../../components/edit-job-postings-modal/edit-job-postings-modal';
import { DeleteJobPostingsModal } from '../../components/delete-job-postings-modal/delete-job-postings-modal';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, AddJobPostingsModal, EditJobPostingsModal, DeleteJobPostingsModal],
  selector: 'app-job-postings',
  styleUrl: './job-postings.css',
  templateUrl: './job-postings.html',
})
export class JobPostings implements OnInit {
  private readonly jobPostingService = inject(JobPostingService);

  readonly jobPostings = signal<JobPostingResponse[]>([]);
  readonly filteredJobPostings = signal<JobPostingResponse[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly searchTerm = signal('');
  readonly statusFilter = signal('All');
  readonly isAddModalOpen = signal(false);
  readonly jobPostingToEdit = signal<JobPostingResponse | null>(null);
  readonly jobPostingToDelete = signal<JobPostingResponse | null>(null);

  ngOnInit(): void {
    this.loadJobPostings();
  }

  loadJobPostings(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.jobPostingService.getAllJobPostings().subscribe({
      next: response => {
        this.isLoading.set(false);
        if (!response.succeeded || !Array.isArray(response.data)) {
          this.hasError.set(true);
          return;
        }
        this.jobPostings.set(response.data);
        this.applyFilters();
      },
      error: error => {
        console.error('Failed to load job postings.', error);
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
    this.filteredJobPostings.set(
      this.jobPostings().filter(posting => {
        const matchesQuery =
          !query ||
          `${posting.title} ${posting.description} ${posting.departmentName} ${posting.positionName}`
            .toLowerCase()
            .includes(query);
        return matchesQuery && (status === 'All' || posting.status === status);
      }),
    );
  }

  openAddModal(): void {
    this.isAddModalOpen.set(true);
  }

  onJobPostingCreated(): void {
    this.isAddModalOpen.set(false);
    this.loadJobPostings();
  }

  editJobPosting(posting: JobPostingResponse): void {
    this.jobPostingToEdit.set(posting);
  }

  onJobPostingUpdated(): void {
    this.jobPostingToEdit.set(null);
    this.loadJobPostings();
  }

  deleteJobPosting(posting: JobPostingResponse): void {
    this.jobPostingToDelete.set(posting);
  }

  onJobPostingDeleted(id: number): void {
    this.jobPostings.update(items => items.filter(posting => posting.id !== id));
    this.applyFilters();
    this.jobPostingToDelete.set(null);
  }

  statusClass(status: JobPostingResponse['status']): string {
    switch (status) {
      case 'Published':
        return 'status-published';
      case 'Draft':
        return 'status-draft';
      case 'OnHold':
        return 'status-on-hold';
      case 'Closed':
      case 'Canceled':
        return 'status-closed';
      case 'Filled':
        return 'status-filled';
    }
  }

  statusLabel(status: JobPostingResponse['status']): string {
    return status === 'OnHold' ? 'On hold' : status;
  }
}
