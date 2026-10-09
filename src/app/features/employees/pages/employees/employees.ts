import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeeApiService, PagentedEmployeeQuery } from '../../services/Employee.Service';
import { EmployeeListItem } from '../../models/employee-list.model';
import {
  EmployeeFilter,
  EmployeeFilterComponent,
} from '../../components/employee-filter/employee-filter';
import { EmployeeSearch } from '../../components/employee-search/employee-search';
import { EmployeeCard } from '../../components/employee-card/employee-card';
import { EmployeePagination } from '../../components/employee-pagination/employee-pagination';
import { EMPTY, Subject, catchError, startWith, switchMap, tap } from 'rxjs';
import { EmployeeCreateModal } from '../../components/employee-create-modal/employee-create-modal';
import { Router } from '@angular/router';

@Component({
  imports: [EmployeeSearch, EmployeeCard, EmployeePagination, EmployeeFilterComponent, EmployeeCreateModal],
  selector: 'app-employees',
  styleUrl: './employees.css',
  templateUrl: './employees.html',
})
export class Employees implements OnInit {
  private readonly employeeApiService = inject(EmployeeApiService);
  private readonly router = inject(Router);

  private readonly queryChange$ = new Subject<void>();

  employees = signal<EmployeeListItem[]>([]);

  currentPage = 1;

  pageSize = 5;

  query: PagentedEmployeeQuery = {
    pageNumber: this.currentPage,
    pageSize: this.pageSize,
    orderBy: 'Id',
  };

  totalPages = 1;

  totalCount = 0;

  hasPreviousPage = false;

  hasNextPage = false;

  isLoading = false;

  hasError = false;

  ngOnInit(): void {
    this.queryChange$.pipe(
        startWith(void 0),
      //  tap(() => {
        //  this.isLoading = true;
         // this.hasError = false;
       // }),
        switchMap(() =>
          this.employeeApiService.getEmployees(this.query).pipe(
            catchError((error) => {
              console.error('Failed to load employees', error);
              this.hasError = true;
              this.isLoading = false;
              return EMPTY;
            })
          )
        ),
        //takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (!response.succeeded) {
          this.hasError = true;
          this.isLoading = false;
          return;
        }
        this.isLoading = true;
        this.employees.set(response.data);
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
        this.isLoading = false;
      });
  }

  loadEmployees(): void {
    this.queryChange$.next();
  }

  onSearch(search: string): void {
    this.currentPage = 1;
    this.query.pageNumber = this.currentPage;
    if (search) {
      this.query.search = search;
    } else {
      delete this.query.search;
    }
     this.queryChange$.next();
  }

  onFilterChange(filter: EmployeeFilter): void {
    this.currentPage = 1;
    this.query.pageNumber = this.currentPage;
    if (filter.status) {
      this.query.filterByStatus = filter.status;
    } else {
      delete this.query.filterByStatus;
    }
    if (filter.orderBy) {
      this.query.orderBy = filter.orderBy;
    } else {
      delete this.query.orderBy;
    }
     this.queryChange$.next();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.query.pageNumber = page;
    this.queryChange$.next();
  }

  viewEmployee(id: number): void {
    this.router.navigate(['/admin/employees', id]);
  }

  editEmployee(id: number): void {
    this.router.navigate(['/admin/employees', id, 'edit']);
  }


  onEmployeeCreated(): void {

  this.loadEmployees();

}

}
