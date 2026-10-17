import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-leave-reject-modal',
  styleUrl: './leave-reject-modal.css',
  templateUrl: './leave-reject-modal.html',
})
export class LeaveRejectModal {
  @Input() employeeName = '';
  @Input() isLoading = false;
  @Output() confirmed = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  reason = '';
  submitted = false;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    if (!this.isLoading) {
      this.closed.emit();
    }
  }

  submit(): void {
    this.submitted = true;
    const reason = this.reason.trim();

    if (!reason || reason.length > 500 || this.isLoading) {
      return;
    }

    this.confirmed.emit(reason);
  }
}
