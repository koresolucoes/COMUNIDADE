import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-code-node',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-code-node.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nCodeNodeComponent {}