import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-animacoes-e-transicoes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './animacoes-e-transicoes.component.html',
  styleUrls: ['./animacoes-e-transicoes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimacoesETransicoesComponent {}
