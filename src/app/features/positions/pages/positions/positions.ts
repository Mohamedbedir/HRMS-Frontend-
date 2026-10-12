import { Component, inject, OnInit, signal } from '@angular/core';
import { PositionService } from '../../services/position.service';
import { PositionResponse } from '../../models/Position-response';
import { PositionCard } from '../../components/position-card/position-card';
import { PositionCreateModal } from '../../components/position-create-modal/position-create-modal';
import { PositionDeleteModal } from '../../components/position-delete-modal/position-delete-modal';
import { PositionEditModal } from '../../components/position-edit-modal/position-edit-modal';

@Component({
  imports: [PositionCard, PositionCreateModal, PositionDeleteModal, PositionEditModal],
  selector: 'app-positions',
  styleUrl: './positions.css',
  templateUrl: './positions.html',
})
export class Positions implements OnInit {
  private readonly positionService = inject(PositionService);

  positions = signal<PositionResponse[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  isCreateModalOpen = signal(false);
  positionPendingEdit = signal<PositionResponse | null>(null);
  positionPendingDelete = signal<PositionResponse | null>(null);

  ngOnInit(): void {
    this.LoadPosition();
  }

  LoadPosition(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.positionService.GetAll().subscribe({
      next: (res) => {
        if (!res.succeeded || !res.data) {
          this.isLoading.set(false);
          this.hasError.set(true);
          return;
        }
        this.positions.set(res.data);
        this.isLoading.set(false);
      },
      error:(err)=>{
        console.error('Failed to load positions.', err);
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    });
  }

  onPositionCreated(): void {
    this.isCreateModalOpen.set(false);
    this.LoadPosition();
  }

  editPosition(position: PositionResponse): void {
    this.positionPendingEdit.set(position);
  }

  closeEditModal(): void {
    this.positionPendingEdit.set(null);
  }

  onPositionUpdated(): void {
    this.closeEditModal();
    this.LoadPosition();
  }

  deletePosition(position: PositionResponse): void {
    this.positionPendingDelete.set(position);
  }

  closeDeleteModal(): void {
    this.positionPendingDelete.set(null);
  }

  onPositionDeleted(id: number): void {
    this.positions.update((positions) => positions.filter((position) => position.id !== id));
    this.closeDeleteModal();
  }
}
