import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-ip',
  standalone: true,
  imports: [],
  templateUrl: './my-ip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyIpComponent implements OnInit {
  ipAddress = signal('Carregando...');
  userAgent = signal('Carregando...');
  error = signal<string | null>(null);
  ipCopyText = signal('Copiar');
  uaCopyText = signal('Copiar');

  ngOnInit() {
    this.fetchIpInfo();
  }

  async fetchIpInfo() {
    this.error.set(null);
    try {
      const response = await fetch('/api/ip');
      if (!response.ok) {
        throw new Error('Não foi possível obter as informações.');
      }
      const data = await response.json();
      this.ipAddress.set(data.ip);
      this.userAgent.set(data.userAgent);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      this.error.set(message);
      this.ipAddress.set('Erro');
      this.userAgent.set('Erro');
    }
  }

  copyToClipboard(text: string, type: 'ip' | 'ua') {
    if (!text || text === 'Carregando...' || text === 'Erro') return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'ip') {
        this.ipCopyText.set('Copiado!');
        setTimeout(() => this.ipCopyText.set('Copiar'), 2000);
      } else {
        this.uaCopyText.set('Copiado!');
        setTimeout(() => this.uaCopyText.set('Copiar'), 2000);
      }
    });
  }
}
