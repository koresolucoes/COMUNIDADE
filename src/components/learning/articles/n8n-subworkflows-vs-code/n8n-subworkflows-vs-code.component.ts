import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-subworkflows-vs-code',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-subworkflows-vs-code.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nSubworkflowsVsCodeComponent {}
