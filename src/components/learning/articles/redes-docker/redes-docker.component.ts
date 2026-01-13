import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-redes-docker',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './redes-docker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedesDockerComponent {}