import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-o-que-sao-webhooks',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './o-que-sao-webhooks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueSaoWebhooksComponent {}
