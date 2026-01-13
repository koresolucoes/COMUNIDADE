import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-logica-de-programacao',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './logica-de-programacao.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogicaDeProgramacaoComponent {}