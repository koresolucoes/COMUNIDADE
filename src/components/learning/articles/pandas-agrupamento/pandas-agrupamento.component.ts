import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pandas-agrupamento',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pandas-agrupamento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PandasAgrupamentoComponent {}
