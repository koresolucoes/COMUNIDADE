import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pandas-limpeza-dados',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pandas-limpeza-dados.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PandasLimpezaDadosComponent {}
