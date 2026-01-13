import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-introducao-docker',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './introducao-docker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroducaoDockerComponent {}