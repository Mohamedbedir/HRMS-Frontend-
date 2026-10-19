import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-payroll-cancel-modal',
  styleUrl: './payroll-cancel-modal.css',
  templateUrl: './payroll-cancel-modal.html',
})
export class PayrollCancelModal {
  @Input() employeeName = '';
  @Input() month = '';
  @Input() year = 0;
  @Input() isLoading = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    if (!this.isLoading) this.closed.emit();
  }
}
