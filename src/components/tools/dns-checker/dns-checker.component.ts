import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

@Component({
  selector: 'app-dns-checker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dns-checker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DnsCheckerComponent {
  domain = signal('google.com');
  recordType = signal<DnsRecordType>('A');
  recordTypes: DnsRecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'];
  
  loading = signal(false);
  error = signal<string | null>(null);
  results = signal<DnsAnswer[] | null>(null);

  async checkDns() {
    if (!this.domain()) return;
    
    this.loading.set(true);
    this.error.set(null);
    this.results.set(null);

    try {
      const response = await fetch(`/api/dns?domain=${encodeURIComponent(this.domain())}&type=${this.recordType()}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao buscar registros DNS.');
      }
      
      this.results.set(data.Answer || []);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  getTypeName(typeId: number): string {
    const typeMap: { [key: number]: string } = {
      1: 'A', 5: 'CNAME', 15: 'MX', 16: 'TXT', 28: 'AAAA', 2: 'NS'
    };
    return typeMap[typeId] || String(typeId);
  }
}
