import { Component, ChangeDetectionStrategy, signal, effect, viewChild, ElementRef, afterNextRender } from '@angular/core';
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
  qrCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('qrCanvas');

  // --- State ---
  text = signal('https://kore.solutions');
  size = signal(300);
  errorCorrectionLevel = signal<'L' | 'M' | 'Q' | 'H'>('M');
  darkColor = signal('#0d1117'); // gray-950
  lightColor = signal('#ffffff');

  constructor() {
    afterNextRender(() => {
        this.generateQrCode();
    });

    effect(() => {
        this.generateQrCode();
    });
  }

  generateQrCode() {
    const canvas = this.qrCanvas().nativeElement;
    if (!canvas) {
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

    QRCode.toCanvas(canvas, this.text() || ' ', options, (error: any) => {
      if (error) {
        console.error('QR Code generation error:', error);
      }
    });
  }
  
  onSizeChange(event: Event) {
    this.size.set(Number((event.target as HTMLInputElement).value));
  }

  downloadQrCode() {
    const canvas = this.qrCanvas().nativeElement;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = dataUrl;
    link.click();
  }
}
