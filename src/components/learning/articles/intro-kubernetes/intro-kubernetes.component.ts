import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-intro-kubernetes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './intro-kubernetes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroKubernetesComponent {}
