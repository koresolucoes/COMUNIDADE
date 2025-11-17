import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-o-que-e-devops',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './o-que-e-devops.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueEDevopsComponent {}
