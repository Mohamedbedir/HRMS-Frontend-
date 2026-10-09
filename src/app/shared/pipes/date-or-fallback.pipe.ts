import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateOrFallback',
  standalone: true,
})
export class DateOrFallbackPipe implements PipeTransform {
  private readonly datePipe = new DatePipe('en-US');

  transform(
    value: string | null | undefined,
    fallback = 'Not terminated',
    format = 'dd MMM yyyy',
  ): string {
    if (!value) {
      return fallback;
    }

    return this.datePipe.transform(value, format) ?? fallback;
  }
}
