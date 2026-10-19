import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CandidateResponse } from '../../models/candidates-response';
import { CandidateService } from '../../services/candidates.service';
import { EditCandidateModal } from '../../components/edit-candidate-modal/edit-candidate-modal';
import { DeleteCandidateModal } from '../../components/delete-candidate-modal/delete-candidate-modal';

@Component({
  imports: [DatePipe, RouterLink, EditCandidateModal, DeleteCandidateModal],
  selector: 'app-candidate-details',
  styleUrl: './candidate-details.css',
  templateUrl: './candidate-details.html',
})
export class CandidateDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly candidateService = inject(CandidateService);

  readonly candidate = signal<CandidateResponse | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly isEditOpen = signal(false);
  readonly isDeleteOpen = signal(false);

  private get candidateId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadCandidate();
  }

  loadCandidate(): void {
    const id = this.candidateId;
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);
    this.candidateService.getCandidateById(id).subscribe({
      next: response => {
        this.isLoading.set(false);
        if (!response.succeeded || !response.data) {
          this.hasError.set(true);
          return;
        }
        this.candidate.set(response.data);
      },
      error: error => {
        console.error('Failed to load candidate details.', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  onCandidateUpdated(): void {
    this.isEditOpen.set(false);
    this.loadCandidate();
  }

  onCandidateDeleted(): void {
    this.isDeleteOpen.set(false);
    this.router.navigate(['/admin/candidates']);
  }
}
