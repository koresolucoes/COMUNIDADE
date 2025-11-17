import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-orquestracao-docker-swarm',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './orquestracao-docker-swarm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrquestracaoDockerSwarmComponent {}
