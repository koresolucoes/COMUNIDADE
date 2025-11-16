import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-subworkflows',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-subworkflows.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nSubworkflowsComponent {}