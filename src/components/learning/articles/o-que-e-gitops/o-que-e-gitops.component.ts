import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-o-que-e-gitops',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './o-que-e-gitops.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueEGitopsComponent {}
