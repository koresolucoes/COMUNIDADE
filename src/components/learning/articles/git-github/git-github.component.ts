import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-git-github',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './git-github.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GitGithubComponent {}
