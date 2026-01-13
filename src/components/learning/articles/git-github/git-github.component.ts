import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-git-github',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './git-github.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GitGithubComponent {}