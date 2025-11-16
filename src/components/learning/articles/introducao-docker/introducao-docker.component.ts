import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-introducao-docker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './introducao-docker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroducaoDockerComponent {}
