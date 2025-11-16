import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-credentials',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-credentials.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nCredentialsComponent {}
