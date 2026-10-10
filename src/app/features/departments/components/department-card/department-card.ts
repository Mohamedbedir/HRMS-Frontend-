import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DepartmentResponse } from '../../models/department-response';

@Component({
  imports: [RouterLink],
  selector: 'app-department-card',
  styleUrl: './department-card.css',
  templateUrl: './department-card.html',
})
export class DepartmentCard {
  @Input({ required: true }) department!: DepartmentResponse;

  @Output() edit = new EventEmitter<DepartmentResponse>();
  @Output() delete = new EventEmitter<DepartmentResponse>();
}
