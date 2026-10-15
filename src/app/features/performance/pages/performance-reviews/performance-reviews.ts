import { Component, inject, OnInit, signal } from '@angular/core';
import { PerformanceReviewResponse } from '../../models/performance-review.model';
import { PerformanceReviewService } from '../../services/performance-review.service';
import { ToastrService } from '@relynn/ngx-toastr';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { PerformanceReviewCreateModal } from '../../components/performance-review-create-modal/performance-review-create-modal';

@Component({
  imports: [DatePipe, PerformanceReviewCreateModal],
  selector: 'app-performance-reviews',
  styleUrl: './performance-reviews.css',
  templateUrl: './performance-reviews.html',
})
export class PerformanceReviews implements OnInit {
  private readonly reviewService = inject(PerformanceReviewService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  reviews = signal<PerformanceReviewResponse[]>([]);

  loading = signal(false);
  errorMessage = signal('');
  isCreateModalOpen = signal(false);

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.reviewService.getAll().subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.reviews.set(response.data ?? []) ;
        } else {
          this.reviews.set([]);
          this.errorMessage.set(response.message || 'Failed to load performance reviews.');
          this.toastr.error(this.errorMessage(), 'Error');
        }

        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error?.error?.message || 'An error occurred while loading reviews.');
        this.toastr.error(this.errorMessage(), 'Error')
      },
    });
  }

  getScoreClass(score: number): string {
    if (score === 5) return 'text-bg-success';
    if (score >= 3) return 'text-bg-warning';  
    return 'text-bg-danger';
  }

  onReviewCreated(): void {
    this.isCreateModalOpen.set(false);
    this.loadReviews();
  }

  openReview(id: number): void {
    void this.router.navigate(['/admin/performance-reviews', id]);
  }
}
