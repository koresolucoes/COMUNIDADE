import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cicd-github-actions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cicd-github-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CicdGithubActionsComponent {}
