import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logica-de-programacao',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './logica-de-programacao.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogicaDeProgramacaoComponent {}
