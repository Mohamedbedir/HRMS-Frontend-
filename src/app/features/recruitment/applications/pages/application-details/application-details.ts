import { DatePipe, Location } from '@angular/common';
import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApplicationResponse } from '../../models/application-respose';
import { ApplicationService } from '../../services/application.service';
import { EditApplicationModal } from '../../components/edit-application-modal/edit-application-modal';
import { DeleteApplicationModal } from '../../components/delete-application-modal/delete-application-modal';

@Component({
  imports: [DatePipe, RouterLink, EditApplicationModal, DeleteApplicationModal],
  selector: 'app-application-details',
  styleUrl: './application-details.css',
  templateUrl: './application-details.html',
})
export class ApplicationDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly loc =inject(Location);
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  readonly application = signal<ApplicationResponse | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly isEditOpen = signal(false);
  readonly isDeleteOpen = signal(false);

  private get applicationId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadApplication();
  }
  Goback() {
    this.loc.back();
  }
  loadApplication(): void {
    const id = this.applicationId;
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);
    this.applicationService.getApplicationById(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (!response.succeeded || !response.data) {
          this.hasError.set(true);
          return;
        }
        this.application.set(response.data);
      },
      error: (error) => {
        console.error('Failed to load application details.', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  onApplicationUpdated(): void {
    this.isEditOpen.set(false);
    this.loadApplication();
  }

  onApplicationDeleted(): void {
    this.isDeleteOpen.set(false);
    this.router.navigate(['/admin/applications']);
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
