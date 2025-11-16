import { Component, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare var QRCode: any;

@Component({
  selector: 'app-qr-code-generator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './qr-code-generator.component.html',
  styleUrls: ['./qr-code-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeGeneratorComponent {
  // --- State ---
  text = signal('https://kore.solutions');
  size = signal(300);
  errorCorrectionLevel = signal<'L' | 'M' | 'Q' | 'H'>('M');
  darkColor = signal('#0d1117'); // gray-950
  lightColor = signal('#ffffff');

  qrCodeDataUrl = signal('');
  generationError = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.generateQrCode();
    });
  }

  generateQrCode() {
    const textToEncode = this.text();
    if (!textToEncode.trim()) {
      this.qrCodeDataUrl.set('');
      this.generationError.set(null);
      return;
    }

    const options = {
      width: this.size(),
      errorCorrectionLevel: this.errorCorrectionLevel(),
      color: {
        dark: this.darkColor(),
        light: this.lightColor(),
      },
      margin: 2,
    };

    QRCode.toDataURL(textToEncode, options, (error: any, url: string) => {
      if (error) {
        console.error('QR Code generation error:', error);
        this.qrCodeDataUrl.set('');
        this.generationError.set('Não foi possível gerar o QR Code. Tente um texto mais curto ou um nível de correção de erro menor.');
      } else {
        this.qrCodeDataUrl.set(url);
        this.generationError.set(null);
      }
    });
  }
  
  onSizeChange(event: Event) {
    this.size.set(Number((event.target as HTMLInputElement).value));
  }

  downloadQrCode() {
    const dataUrl = this.qrCodeDataUrl();
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = dataUrl;
    link.click();
  }
}
