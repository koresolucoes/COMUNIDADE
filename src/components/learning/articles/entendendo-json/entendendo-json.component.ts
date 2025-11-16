import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-entendendo-json',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './entendendo-json.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntendendoJsonComponent {}
