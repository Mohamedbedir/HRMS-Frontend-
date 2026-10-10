import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentResponse } from '../../models/department-response';
import { DepartmentService } from '../../services/department.service';

@Component({
  imports: [DatePipe],
  selector: 'app-department-details',
  styleUrl: './department-details.css',
  templateUrl: './department-details.html',
})
export class DepartmentDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly departmentService = inject(DepartmentService);

  department = signal<DepartmentResponse | null>(null);
  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.loadDepartment(id);
  }

  loadDepartment(id: number): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.departmentService.GetdepartmentByid(id).subscribe({
      next: (response) => {
        if (!response.succeeded || !response.data) {
          this.isLoading.set(false);
          this.hasError.set(true);
          return;
        }

        this.department.set(response.data);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load department details.', error);
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }

  retry(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.loadDepartment(id);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/departments']);
  }
}
