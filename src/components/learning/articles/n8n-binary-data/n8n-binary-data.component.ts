import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-binary-data',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-binary-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nBinaryDataComponent {}