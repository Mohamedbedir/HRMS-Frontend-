import { Component, inject, OnInit, signal } from '@angular/core';
import { DepartmentCard } from '../../components/department-card/department-card';
import { DepartmentDeleteModal } from '../../components/department-delete-modal/department-delete-modal';
import { DepartmentResponse } from '../../models/department-response';
import { DepartmentService } from '../../services/department.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DepartmentCard, DepartmentDeleteModal],
  styleUrl: './departments.css',
  templateUrl: './departments.html',
})
export class Departments implements OnInit {
  private readonly departmentService = inject(DepartmentService);

  departments = signal<DepartmentResponse[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  notice = signal<string | null>(null);
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
    this.notice.set('Department creation is not available yet because the API endpoint is not implemented.');
  }

  editDepartment(): void {
    this.notice.set('Department editing is not available yet because the API endpoint is not implemented.');
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
