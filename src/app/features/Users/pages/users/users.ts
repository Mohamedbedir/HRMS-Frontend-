import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from '@relynn/ngx-toastr';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ChangePassword, EditRolesBody, RegistNewUser, UserResponse } from '../../models/user-response';
import { UserService } from '../../services/user.service';
import { ChangePasswordModal } from '../../components/change-password-modal/change-password-modal';
import { DeleteUserModal } from '../../components/delete-user-modal/delete-user-modal';
import { LockUserModal } from '../../components/lock-user-modal/lock-user-modal';
import { UnlockUserModal } from '../../components/unlock-user-modal/unlock-user-modal';
import { RegistUserModal } from '../../components/regist-user-modal/regist-user-modal';
import { EditRolesUserModal } from '../../components/edit-roles-user-modal/edit-roles-user-modal';

@Component({
  imports: [
    ChangePasswordModal,
    DeleteUserModal,
    LockUserModal,
    UnlockUserModal,
    RegistUserModal,
    EditRolesUserModal,
  ],
  selector: 'app-users',
  styleUrl: './users.css',
  templateUrl: './users.html',
})
export class Users implements OnInit {
  private readonly userService = inject(UserService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();
  private loadRequestId = 0;

  readonly users = signal<UserResponse[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly searchTerm = signal('');

  selectedUser: UserResponse | null = null;
  activeModal: 'delete' | 'lock' | 'unlock' | 'password' | 'register' | 'edit-roles' | null = null;
  isSavingAction = false;

  ngOnInit(): void {
    this.searchChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => this.loadUsers(search));

    this.loadUsers('');
  }

  onSearchChange(search: string): void {
    this.searchTerm.set(search);
    this.searchChanges.next(search.trim());
  }

  loadUsers(search = this.searchTerm().trim()): void {
    const requestId = ++this.loadRequestId;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.getAllUser(search ? { searsh: search } : undefined).subscribe({
      next: (response) => {
        if (requestId !== this.loadRequestId) {
          return;
        }
        this.isLoading.set(false);
        if (!response.succeeded) {
          this.errorMessage.set(
            response.message || response.errors?.[0] || 'Could not load users.',
          );
          return;
        }
        this.users.set(response.data ?? []);
      },
      error: (error: HttpErrorResponse) => {
        if (requestId !== this.loadRequestId) {
          return;
        }
        console.error('Failed to load users.', error);
        this.isLoading.set(false);
        this.errorMessage.set(this.getErrorMessage(error, 'Failed to load users.'));
      },
    });
  }

  openModal(user: UserResponse, modal: NonNullable<Users['activeModal']>): void {
    this.selectedUser = user;
    this.activeModal = modal;
  }

  closeModal(): void {
    if (this.isSavingAction) {
      return;
    }
    this.activeModal = null;
    this.selectedUser = null;
  }

  deleteUser(): void {
    const user = this.selectedUser;
    if (!user || this.isSavingAction) {
      return;
    }

    this.isSavingAction = true;
    this.userService.deleteUser(user.id).subscribe({
      next: (response) => this.handleActionResponse(response, 'User deleted successfully.'),
      error: (error: HttpErrorResponse) => this.handleActionError(error, 'Could not delete user.'),
    });
  }

  lockUser(): void {
    const user = this.selectedUser;
    if (!user || this.isSavingAction) {
      return;
    }

    this.isSavingAction = true;
    this.userService.lockUser({ id: user.id }).subscribe({
      next: (response) => this.handleActionResponse(response, 'User locked successfully.'),
      error: (error: HttpErrorResponse) => this.handleActionError(error, 'Could not lock user.'),
    });
  }

  unlockUser(): void {
    const user = this.selectedUser;
    if (!user || this.isSavingAction) {
      return;
    }

    this.isSavingAction = true;
    this.userService.UnlockUser({ id: user.id }).subscribe({
      next: (response) => this.handleActionResponse(response, 'User unlocked successfully.'),
      error: (error: HttpErrorResponse) => this.handleActionError(error, 'Could not unlock user.'),
    });
  }

  changePassword(password: ChangePassword): void {
    if (!this.selectedUser || this.isSavingAction) {
      return;
    }

    this.isSavingAction = true;
    this.userService.changePassword(password).subscribe({
      next: (response) => this.handleActionResponse(response, 'Password changed successfully.'),
      error: (error: HttpErrorResponse) =>
        this.handleActionError(error, 'Could not change the user password.'),
    });
  }

  registerUser(user: RegistNewUser): void {
    if (this.isSavingAction) {
      return;
    }

    this.isSavingAction = true;
    this.userService.registNewUser(user).subscribe({
      next: (response) => this.handleActionResponse(response, 'User added successfully.'),
      error: (error: HttpErrorResponse) => this.handleActionError(error, 'Could not add user.'),
    });
  }

  editUserRoles(body: EditRolesBody): void {
    if (this.isSavingAction) {
      return;
    }

    this.isSavingAction = true;
    this.userService.EditRolesForUser(body).subscribe({
      next: (response) => this.handleActionResponse(response, 'User roles updated successfully.'),
      error: (error: HttpErrorResponse) =>
        this.handleActionError(error, 'Could not update user roles.'),
    });
  }

  isLocked(user: UserResponse): boolean {
    return !!user.lockoutEnd && new Date(user.lockoutEnd).getTime() > Date.now();
  }

  formatLockoutEnd(lockoutEnd: string | null): string | null {
    if (!lockoutEnd) {
      return null;
    }

    const date = new Date(lockoutEnd);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private handleActionResponse(
    response: { succeeded: boolean; message: string | null; errors: string[] | null },
    successMessage: string,
  ): void {
    this.isSavingAction = false;
    if (!response.succeeded) {
      this.toastr.error(response.message || response.errors?.[0] || 'The action could not be completed.', 'Action failed');
      return;
    }

    this.toastr.success(response.message || successMessage, 'Success');
    const search = this.searchTerm().trim();
    this.closeModal();
    this.loadUsers(search);
  }

  private handleActionError(error: HttpErrorResponse, fallbackMessage: string): void {
    console.error('Failed to update user.', error);
    this.isSavingAction = false;
    this.toastr.error(this.getErrorMessage(error, fallbackMessage), 'Action failed');
  }

  private getErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    const payload: unknown = error.error;
    if (typeof payload === 'object' && payload !== null) {
      const response = payload as { message?: unknown; errors?: unknown };
      if (typeof response.message === 'string' && response.message.trim()) {
        return response.message;
      }
      if (Array.isArray(response.errors) && typeof response.errors[0] === 'string') {
        return response.errors[0];
      }
    }
    return error.message || fallbackMessage;
  }
}
