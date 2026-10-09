import {
  Component,
  DestroyRef,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  imports: [FormsModule],
  selector: 'app-employee-search',
  styleUrl: './employee-search.css',
  templateUrl: './employee-search.html',
})
export class EmployeeSearch {
  @Output()
  searchChange = new EventEmitter<string>();

  searchValue = '';

  private readonly destroyRef = inject(DestroyRef);

  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((search) => {
        this.searchChange.emit(search);
      });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchValue.trim());
  }

  clearSearch(): void {
    this.searchValue = '';
    this.searchSubject.next('');
  }
}
