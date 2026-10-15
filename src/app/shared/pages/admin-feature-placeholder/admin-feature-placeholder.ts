import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-feature-placeholder',
  styleUrl: './admin-feature-placeholder.css',
  templateUrl: './admin-feature-placeholder.html',
})
export class AdminFeaturePlaceholder {
  private readonly route = inject(ActivatedRoute);

  get title(): string {
    const title = this.route.snapshot.data['title'];
    return typeof title === 'string' ? title : 'HR feature';
  }
}
