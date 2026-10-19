import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-payroll-pay-modal',
  styleUrl: './payroll-pay-modal.css',
  templateUrl: './payroll-pay-modal.html',
})
export class PayrollPayModal {
  @Input() employeeName = '';
  @Input() month = '';
  @Input() year = 0;
  @Input() amount = 0;
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
