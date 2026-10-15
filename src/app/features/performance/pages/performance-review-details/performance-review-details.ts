import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PerformanceReviewResponse } from '../../models/performance-review.model';
import { PerformanceReviewService } from '../../services/performance-review.service';

@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-performance-review-details',
  styleUrl: './performance-review-details.css',
  templateUrl: './performance-review-details.html',
})
export class PerformanceReviewDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reviewService = inject(PerformanceReviewService);

  readonly review = signal<PerformanceReviewResponse | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  private reviewId: number | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.reviewId = id;
    this.loadReview(id);
  }

  retry(): void {
    if (this.reviewId !== null) {
      this.loadReview(this.reviewId);
    }
  }

  goBack(): void {
    void this.router.navigate(['/admin/performance-reviews']);
  }

  getScoreClass(score: number): string {
    if (score >= 4) return 'score-excellent';
    if (score >= 3) return 'score-good';
    if (score >= 2) return 'score-warning';
    return 'score-low';
  }

  getScoreLabel(score: number): string {
    if (score >= 4.5) return 'Outstanding';
    if (score >= 4) return 'Excellent';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Needs improvement';
    return 'Below expectations';
  }

  getScorePercentage(score: number): number {
    return Math.max(0, Math.min(score, 5)) * 20;
  }

  getReviewMonth(month: number): string {
    return new Intl.DateTimeFormat('en', { month: 'long' }).format(
      new Date(2000, month - 1, 1),
    );
  }

  private loadReview(id: number): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.reviewService.getById(id).subscribe({
      next: (response) => {
        if (!response.succeeded || !response.data) {
          console.error('Failed to load performance review details.', response.message);
          this.isLoading.set(false);
          this.hasError.set(true);
          return;
        }

        this.review.set(response.data);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load performance review details.', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }
}
