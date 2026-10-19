import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-payroll-approve-modal',
  styleUrl: './payroll-approve-modal.css',
  templateUrl: './payroll-approve-modal.html',
})
export class PayrollApproveModal {
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
