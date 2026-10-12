import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PositionResponse } from '../../models/Position-response';

@Component({
  imports: [RouterLink],
  selector: 'app-position-card',
  styleUrl: './position-card.css',
  templateUrl: './position-card.html',
})
export class PositionCard {

  @Input({ required: true }) position!: PositionResponse;

  @Output() edit = new EventEmitter<PositionResponse>();
  @Output() delete = new EventEmitter<PositionResponse>();
}
