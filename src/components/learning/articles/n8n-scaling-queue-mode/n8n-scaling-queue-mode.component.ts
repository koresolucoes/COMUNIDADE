import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-scaling-queue-mode',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-scaling-queue-mode.component.html',
  styleUrls: ['./n8n-scaling-queue-mode.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nScalingQueueModeComponent {}
