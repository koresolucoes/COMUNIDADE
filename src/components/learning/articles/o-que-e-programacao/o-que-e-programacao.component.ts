import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-o-que-e-programacao',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './o-que-e-programacao.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueEProgramacaoComponent {}