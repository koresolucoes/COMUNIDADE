import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-o-que-e-jwt',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './o-que-e-jwt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueEJwtComponent {}
