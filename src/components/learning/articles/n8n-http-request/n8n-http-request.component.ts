import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-http-request',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-http-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nHttpRequestComponent {}
