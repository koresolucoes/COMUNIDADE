import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-data-flow',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-data-flow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nDataFlowComponent {}
