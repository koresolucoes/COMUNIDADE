import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-redes-docker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './redes-docker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedesDockerComponent {}
