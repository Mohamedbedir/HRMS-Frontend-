import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-leave-cancel-modal',
  styleUrl: './leave-cancel-modal.css',
  templateUrl: './leave-cancel-modal.html',
})
export class LeaveCancelModal {
  @Input() employeeName = '';
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
