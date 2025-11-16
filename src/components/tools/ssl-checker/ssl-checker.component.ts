import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

interface CertificateDetails {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  valid_from: string;
  valid_to: string;
  serialNumber: string;
  fingerprint: string;
  fingerprint256: string;
  subjectaltname: string;
  issuerChain: any[];
}

@Component({
  selector: 'app-ssl-checker',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './ssl-checker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SslCheckerComponent {
  domain = signal('google.com');
  loading = signal(false);
  error = signal<string | null>(null);
  results = signal<CertificateDetails | null>(null);

  daysRemaining = signal<number | null>(null);
  validityPercentage = signal<number>(0);
  status = signal<'valid' | 'expiring' | 'expired' | 'error' | 'idle'>('idle');


  async checkSsl() {
    if (!this.domain().trim()) {
      this.error.set('Por favor, insira um domínio.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.results.set(null);
    this.status.set('idle');

    try {
      const response = await fetch(`/api/ssl-check?domain=${encodeURIComponent(this.domain().trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao buscar informações do certificado.');
      }

      this.results.set(data);
      this.calculateValidity(data.valid_from, data.valid_to);

    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      this.error.set(message);
      this.status.set('error');
    } finally {
      this.loading.set(false);
    }
  }

  private calculateValidity(validFrom: string, validTo: string) {
    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);
    const now = new Date();

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        this.status.set('error');
        this.daysRemaining.set(null);
        this.validityPercentage.set(0);
        return;
    }

    const totalDuration = toDate.getTime() - fromDate.getTime();
    const elapsed = now.getTime() - fromDate.getTime();
    const remainingTime = toDate.getTime() - now.getTime();
    
    this.validityPercentage.set(Math.max(0, Math.min(100, (elapsed / totalDuration) * 100)));

    const remainingDays = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    this.daysRemaining.set(remainingDays);

    if (remainingDays < 0) {
      this.status.set('expired');
    } else if (remainingDays <= 30) {
      this.status.set('expiring');
    } else {
      this.status.set('valid');
    }
  }

  get sanList(): string[] {
    const subjectAltName = this.results()?.subjectaltname;
    if (!subjectAltName) return [];
    return subjectAltName.split(',').map(s => s.trim().replace('DNS:', ''));
  }
  
  objectEntries(obj: Record<string, string> | undefined): [string, string][] {
    if (!obj) return [];
    return Object.entries(obj);
  }
}
