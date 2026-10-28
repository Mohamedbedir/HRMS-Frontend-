import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-unauthorized',
  styleUrl: './unauthorized.css',
  templateUrl: './unauthorized.html',
})
export class Unauthorized {
  private readonly loc=inject(Location);
  Goback(){
    this.loc.back();
  }
}
