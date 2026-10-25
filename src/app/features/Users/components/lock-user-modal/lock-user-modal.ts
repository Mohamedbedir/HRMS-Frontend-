import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UserResponse } from '../../models/user-response';

@Component({
  selector: 'app-lock-user-modal',
  styleUrl: './lock-user-modal.css',
  templateUrl: './lock-user-modal.html',
})
export class LockUserModal {
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
