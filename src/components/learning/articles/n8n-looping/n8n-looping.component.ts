import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-looping',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-looping.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nLoopingComponent {}
