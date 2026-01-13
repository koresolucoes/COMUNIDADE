import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-introducao-pseudocodigo',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './introducao-pseudocodigo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroducaoPseudocodigoComponent {}