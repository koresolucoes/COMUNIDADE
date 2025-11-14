import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';

@Component({
  selector: 'app-uuid-generator',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent],
  templateUrl: './uuid-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UuidGeneratorComponent {
  generatedUuid = signal('');
  copyButtonText = signal('Copiar');
  
  constructor() {
    this.generateUuid();
  }

  generateUuid() {
    try {
      this.generatedUuid.set(crypto.randomUUID());
    } catch (e) {
      this.generatedUuid.set('Seu navegador não suporta a geração de UUIDs criptograficamente seguros.');
    }
  }

  copyToClipboard() {
    if (!this.generatedUuid() || !crypto.randomUUID) return;
    navigator.clipboard.writeText(this.generatedUuid()).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar'), 2000);
    });
  }
}