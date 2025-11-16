
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-entendendo-expressoes-cron',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './entendendo-expressoes-cron.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntendendoExpressoesCronComponent {}
