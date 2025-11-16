
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tipos-de-dados',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tipos-de-dados.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiposDeDadosComponent {}
