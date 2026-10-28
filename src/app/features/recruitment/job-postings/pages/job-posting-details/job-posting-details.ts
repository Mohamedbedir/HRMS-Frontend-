import { CurrencyPipe, DatePipe, Location } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { JobPostingResponse } from '../../models/job-postings-response';
import { JobPostingService } from '../../services/jobposting.service';
import { EditJobPostingsModal } from '../../components/edit-job-postings-modal/edit-job-postings-modal';
import { DeleteJobPostingsModal } from '../../components/delete-job-postings-modal/delete-job-postings-modal';

@Component({
  imports: [CurrencyPipe, DatePipe, EditJobPostingsModal, DeleteJobPostingsModal],
  selector: 'app-job-posting-details',
  styleUrl: './job-posting-details.css',
  templateUrl: './job-posting-details.html',
})
export class JobPostingDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly loc=inject(Location);
  private readonly router = inject(Router);
  private readonly jobPostingService = inject(JobPostingService);
  private readonly toastr = inject(ToastrService);

  readonly jobPosting = signal<JobPostingResponse | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly isEditOpen = signal(false);
  readonly isDeleteOpen = signal(false);

  private get jobPostingId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadJobPosting();
  }

  Goback(){
    this.loc.back();
  }

  loadJobPosting(): void {
    const id = this.jobPostingId;
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);
    this.jobPostingService.getJobPostingById(id).subscribe({
      next: response => {
        this.isLoading.set(false);
        if (!response.succeeded || !response.data) {
          this.hasError.set(true);
          return;
        }
        this.jobPosting.set(response.data);
      },
      error: error => {
        console.error('Failed to load job posting details.', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  onJobPostingUpdated(): void {
    this.isEditOpen.set(false);
    this.loadJobPosting();
  }

  onJobPostingDeleted(): void {
    this.isDeleteOpen.set(false);
    this.router.navigate(['/admin/job-postings']);
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

  shareOnLinkedIn(): void {
    this.openShareWindow(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.getShareUrl())}`,
    );
  }

  shareOnFacebook(): void {
    this.openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.getShareUrl())}`,
    );
  }

  async copyLink(): Promise<void> {
    const url = this.getShareUrl();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('textarea');
        input.value = url;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand('copy');
        input.remove();
        if (!copied) {
          throw new Error('Clipboard access is unavailable.');
        }
      }
      this.toastr.success('Job posting link copied to clipboard.', 'Link copied');
    } catch (error) {
      console.error('Failed to copy job posting link.', error);
      this.toastr.error('The link could not be copied. Please copy it from your browser address bar.', 'Copy failed');
    }
  }

  async sharePosting(): Promise<void> {
    const posting = this.jobPosting();
    if (!posting) {
      return;
    }

    if (!navigator.share) {
      this.toastr.info('Use LinkedIn, Facebook or Copy link to share this posting.', 'Sharing unavailable');
      return;
    }

    try {
      await navigator.share({
        title: posting.title,
        text: `${posting.title} — ${posting.departmentName} · ${posting.positionName}`,
        url: this.getShareUrl(),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to share job posting.', error);
      this.toastr.error('The job posting could not be shared.', 'Share failed');
    }
  }

  private getShareUrl(): string {
    return new URL(this.router.url, window.location.origin).href;
  }

  private openShareWindow(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
