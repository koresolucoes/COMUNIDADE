import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-monitoramento-observabilidade',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './monitoramento-observabilidade.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitoramentoObservabilidadeComponent {}
