import { Component, inject, OnInit, signal } from '@angular/core';
import { PositionService } from '../../services/position.service';
import { DatePipe, DecimalPipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PositionResponse } from '../../models/Position-response';

@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-position-details',
  styleUrl: './position-details.css',
  templateUrl: './position-details.html',
})
export class PositionDetails implements OnInit {
  
  private readonly positionService=inject(PositionService)
  private readonly loc=inject(Location)
  private readonly route = inject(ActivatedRoute);
  
  isLoading = signal(true);
  hasError = signal(false);
  position=signal<PositionResponse|null>(null)

  ngOnInit(): void {
    const id =Number(this.route.snapshot.paramMap.get('id'));
    if(!Number.isInteger(id) || id <=0){
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }
    this.loadpostion(id);
  }

  loadpostion(id:number){
    this.isLoading.set(true);
    this.hasError.set(false);

    this.positionService.GetpositionByid(id).subscribe({
      next:(res)=>{
        if(!res.succeeded || !res.data){
          this.isLoading.set(false)
          this.hasError.set(true)
          return;
        }
        this.position.set(res.data)
        this.isLoading.set(false)
      },
      error:(err)=>{
        this.hasError.set(true)
        this.isLoading.set(false)
      }
    })
  }

  retry(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.loadpostion(id);
    }
  }

  goBack(): void {
    this.loc.back();
  }
}
