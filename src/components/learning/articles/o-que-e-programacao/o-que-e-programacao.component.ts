import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-o-que-e-programacao',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './o-que-e-programacao.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueEProgramacaoComponent {}
