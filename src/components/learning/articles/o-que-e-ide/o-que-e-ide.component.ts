import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-o-que-e-ide',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './o-que-e-ide.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueEIdeComponent {}
