
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-o-que-e-n8n',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './o-que-e-n8n.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueEN8nComponent {}
