import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-code-generator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './qr-code-generator.component.html',
  styleUrls: ['./qr-code-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeGeneratorComponent implements OnInit {
  // --- State ---
  text = signal('https://kore.solutions');
  size = signal(300);
  errorCorrectionLevel = signal<'L' | 'M' | 'Q' | 'H'>('M');
  darkColor = signal('#0d1117'); // gray-950
  lightColor = signal('#ffffff');

  qrCodeDataUrl = signal('');
  generationError = signal<string | null>(null);

  ngOnInit() {
    // Attempt to generate on init, with retries to wait for the library.
    this.generateQrCode();
  }

  private _performGeneration() {
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

    (window as any).QRCode.toDataURL(textToEncode, options, (error: any, url: string) => {
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

  generateQrCode(retryCount = 5) {
    // Check if the QRCode library is available on the window object.
    if (typeof (window as any).QRCode !== 'undefined') {
      this._performGeneration();
    } else if (retryCount > 0) {
      // If not available, wait and retry.
      setTimeout(() => this.generateQrCode(retryCount - 1), 200);
    } else {
      // If it's still not available after retries, show an error.
      this.generationError.set('Erro: A biblioteca de geração de QR Code não carregou.');
      console.error('QRCode library failed to load after several retries.');
    }
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
