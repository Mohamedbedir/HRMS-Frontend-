import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-leave-approve-modal',
  styleUrl: './leave-approve-modal.css',
  templateUrl: './leave-approve-modal.html',
})
export class LeaveApproveModal {
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
