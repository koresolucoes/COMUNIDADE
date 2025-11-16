import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-o-que-e-banco-de-dados',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './o-que-e-banco-de-dados.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueEBancoDeDadosComponent {}
