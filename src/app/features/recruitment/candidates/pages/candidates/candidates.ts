import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CandidateResponse } from '../../models/candidates-response';
import { CandidateService } from '../../services/candidates.service';
import { AddCandidateModal } from '../../components/add-candidate-modal/add-candidate-modal';
import { EditCandidateModal } from '../../components/edit-candidate-modal/edit-candidate-modal';
import { DeleteCandidateModal } from '../../components/delete-candidate-modal/delete-candidate-modal';

@Component({
  imports: [DatePipe, RouterLink, AddCandidateModal, EditCandidateModal, DeleteCandidateModal],
  selector: 'app-candidates',
  styleUrl: './candidates.css',
  templateUrl: './candidates.html',
})
export class Candidates implements OnInit {
  private readonly candidateService = inject(CandidateService);

  readonly candidates = signal<CandidateResponse[]>([]);
  readonly filteredCandidates = signal<CandidateResponse[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly searchTerm = signal('');
  readonly isAddModalOpen = signal(false);
  readonly candidateToEdit = signal<CandidateResponse | null>(null);
  readonly candidateToDelete = signal<CandidateResponse | null>(null);

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.candidateService.getAllCandidates().subscribe({
      next: response => {
        this.isLoading.set(false);
        if (!response.succeeded || !Array.isArray(response.data)) {
          this.hasError.set(true);
          return;
        }
        this.candidates.set(response.data);
        this.applySearch();
      },
      error: error => {
        console.error('Failed to load candidates.', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applySearch();
  }

  private applySearch(): void {
    const query = this.searchTerm().trim().toLowerCase();
    this.filteredCandidates.set(
      query ? this.candidates().filter(candidate =>
            `${candidate.firstName} ${candidate.lastName} ${candidate.email} ${candidate.phone}`
              .toLowerCase()
              .includes(query),
          )
        : this.candidates(),
    );
  }

  openAddModal(): void {
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  onCandidateCreated(): void {
    this.closeAddModal();
    this.loadCandidates();
  }

  openEditModal(candidate: CandidateResponse): void {
    this.candidateToEdit.set(candidate);
  }

  closeEditModal(): void {
    this.candidateToEdit.set(null);
  }

  onCandidateUpdated(): void {
    this.closeEditModal();
    this.loadCandidates();
  }

  openDeleteModal(candidate: CandidateResponse): void {
    this.candidateToDelete.set(candidate);
  }

  closeDeleteModal(): void {
    this.candidateToDelete.set(null);
  }

  onCandidateDeleted(id: number): void {
    this.candidates.update(items => items.filter(candidate => candidate.id !== id));
    this.applySearch();
    this.closeDeleteModal();
  }
}
