import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pandas-selecao-filtragem',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pandas-selecao-filtragem.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PandasSelecaoFiltragemComponent {}
