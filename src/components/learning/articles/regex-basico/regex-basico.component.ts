import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-regex-basico',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './regex-basico.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegexBasicoComponent {}
