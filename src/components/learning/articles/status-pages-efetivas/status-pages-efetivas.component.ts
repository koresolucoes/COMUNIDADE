
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-pages-efetivas',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './status-pages-efetivas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPagesEfetivasComponent {
  systemStatus = signal<'operational' | 'degraded' | 'outage'>('operational');

  statusConfig = {
    operational: {
        color: 'bg-green-500',
        icon: 'check_circle',
        text: 'Todos os sistemas operacionais',
        message: 'Nenhum incidente ativo no momento.'
    },
    degraded: {
        color: 'bg-yellow-500',
        icon: 'warning',
        text: 'Performance Degradada',
        message: 'Estamos investigando lentidão na API de Pagamentos.'
    },
    outage: {
        color: 'bg-red-500',
        icon: 'error',
        text: 'Interrupção de Serviço',
        message: 'Incidente Crítico: O banco de dados principal está inacessível.'
    }
  };

  setMockStatus(status: 'operational' | 'degraded' | 'outage') {
    this.systemStatus.set(status);
  }
}
