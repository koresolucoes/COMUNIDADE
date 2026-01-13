import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-regex-basico',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './regex-basico.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegexBasicoComponent {}