import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UserResponse } from '../../models/user-response';

@Component({
  selector: 'app-delete-user-modal',
  styleUrl: './delete-user-modal.css',
  templateUrl: './delete-user-modal.html',
})
export class DeleteUserModal {
  @Input({ required: true }) user!: UserResponse;
  @Input() isLoading = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    if (!this.isLoading) {
      this.closed.emit();
    }
  }
}
