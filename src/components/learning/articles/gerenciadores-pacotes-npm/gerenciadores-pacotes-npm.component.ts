import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-gerenciadores-pacotes-npm',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './gerenciadores-pacotes-npm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GerenciadoresPacotesNpmComponent {}