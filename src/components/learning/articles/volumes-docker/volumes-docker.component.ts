import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-volumes-docker',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './volumes-docker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumesDockerComponent {}