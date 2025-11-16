import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-error-handling',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-error-handling.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nErrorHandlingComponent {}