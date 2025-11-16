import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-volumes-docker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './volumes-docker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumesDockerComponent {}
