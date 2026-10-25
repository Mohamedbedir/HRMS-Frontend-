import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Roles } from '../../../../core/constants/roles';
import { EditRolesBody, UserResponse } from '../../models/user-response';

@Component({
  selector: 'app-edit-roles-user-modal',
  styleUrl: './edit-roles-user-modal.css',
  templateUrl: './edit-roles-user-modal.html',
})
export class EditRolesUserModal implements OnInit {
  @Input({ required: true }) user!: UserResponse;
  @Input() isLoading = false;
  @Output() submitted = new EventEmitter<EditRolesBody>();
  @Output() closed = new EventEmitter<void>();

  readonly roles = Object.values(Roles);
  selectedRoles: string[] = [];

  ngOnInit(): void {
    this.selectedRoles = [...(this.user.roles ?? [])];
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  isSelected(role: string): boolean {
    return this.selectedRoles.includes(role);
  }

  toggleRole(role: string, event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    this.selectedRoles = event.target.checked
      ? [...this.selectedRoles, role]
      : this.selectedRoles.filter((selectedRole) => selectedRole !== role);
  }

  close(): void {
    if (!this.isLoading) {
      this.closed.emit();
    }
  }

  submit(): void {
    if (this.isLoading) {
      return;
    }

    this.submitted.emit({
      userId: this.user.id,
      roles: this.selectedRoles,
    });
  }
}
