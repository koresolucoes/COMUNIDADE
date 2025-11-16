import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-split-in-batches',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-split-in-batches.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nSplitInBatchesComponent {}