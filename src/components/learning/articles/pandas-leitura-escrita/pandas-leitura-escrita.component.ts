import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pandas-leitura-escrita',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pandas-leitura-escrita.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PandasLeituraEscritaComponent {}
