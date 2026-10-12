import { Component, inject, OnInit, signal } from '@angular/core';
import { DepartmentCard } from '../../components/department-card/department-card';
import { DepartmentCreateModal } from '../../components/department-create-modal/department-create-modal';
import { DepartmentDeleteModal } from '../../components/department-delete-modal/department-delete-modal';
import { DepartmentEditModal } from '../../components/department-edit-modal/department-edit-modal';
import { DepartmentResponse } from '../../models/department-response';
import { DepartmentService } from '../../services/department.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DepartmentCard, DepartmentCreateModal, DepartmentDeleteModal, DepartmentEditModal],
  styleUrl: './departments.css',
  templateUrl: './departments.html',
})
export class Departments implements OnInit {
  private readonly departmentService = inject(DepartmentService);

  departments = signal<DepartmentResponse[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  notice = signal<string | null>(null);
  isCreateModalOpen = signal(false);
  departmentPendingEdit = signal<DepartmentResponse | null>(null);
  departmentPendingDelete = signal<DepartmentResponse | null>(null);

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.departmentService.GetAll().subscribe({
      next: (response) => {
        if (!response.succeeded || !response.data) {
          this.isLoading.set(false);
          this.hasError.set(true);
          return;
        }

        this.departments.set(response.data);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load departments.', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  createDepartment(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onDepartmentCreated(): void {
    this.closeCreateModal();
    this.loadDepartments();
  }

  editDepartment(department: DepartmentResponse): void {
    this.departmentPendingEdit.set(department);
  }

  closeEditModal(): void {
    this.departmentPendingEdit.set(null);
  }

  onDepartmentUpdated(): void {
    this.closeEditModal();
    this.loadDepartments();
  }

  deleteDepartment(department: DepartmentResponse): void {
    this.departmentPendingDelete.set(department);
  }

  closeDeleteModal(): void {
    this.departmentPendingDelete.set(null);
  }

  onDepartmentDeleted(id: number): void {
    this.departments.update((departments) =>
      departments.filter((department) => department.id !== id),
    );
    this.departmentPendingDelete.set(null);
  }

  clearNotice(): void {
    this.notice.set(null);
  }
}
