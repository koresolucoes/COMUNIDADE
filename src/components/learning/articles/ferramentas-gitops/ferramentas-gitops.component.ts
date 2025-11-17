import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ferramentas-gitops',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ferramentas-gitops.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FerramentasGitopsComponent {}
