import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pandas-intro',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pandas-intro.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PandasIntroComponent {}
