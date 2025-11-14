import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';

@Component({
  selector: 'app-password-generator',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent],
  templateUrl: './password-generator.component.html',
  styleUrls: ['./password-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordGeneratorComponent {
  // Options
  length = signal(24);
  includeUppercase = signal(true);
  includeLowercase = signal(true);
  includeNumbers = signal(true);
  includeSymbols = signal(true);

  // Output
  generatedPassword = signal('');
  copyButtonText = signal('Copiar');

  strength = computed(() => {
    const len = this.length();
    const charTypes = [this.includeUppercase(), this.includeLowercase(), this.includeNumbers(), this.includeSymbols()].filter(Boolean).length;
    
    if (len < 8 || charTypes < 2) return { text: 'Muito Fraca', color: 'text-red-500', width: '25%' };
    if (len < 12 || charTypes < 3) return { text: 'Fraca', color: 'text-orange-500', width: '50%' };
    if (len < 16 || charTypes < 4) return { text: 'Média', color: 'text-yellow-500', width: '75%' };
    return { text: 'Forte', color: 'text-green-accent', width: '100%' };
  });

  constructor() {
    this.generatePassword();
  }

  generatePassword() {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charPool = '';
    let result = '';

    if (this.includeUppercase()) {
      charPool += uppercaseChars;
      result += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    }
    if (this.includeLowercase()) {
      charPool += lowercaseChars;
      result += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    }
    if (this.includeNumbers()) {
      charPool += numberChars;
      result += numberChars[Math.floor(Math.random() * numberChars.length)];
    }
    if (this.includeSymbols()) {
      charPool += symbolChars;
      result += symbolChars[Math.floor(Math.random() * symbolChars.length)];
    }

    if (!charPool) {
      this.generatedPassword.set('Selecione uma opção');
      return;
    }

    const remainingLength = this.length() - result.length;
    for (let i = 0; i < remainingLength; i++) {
      result += charPool[Math.floor(Math.random() * charPool.length)];
    }

    // Shuffle the result to ensure random character placement
    this.generatedPassword.set(result.split('').sort(() => 0.5 - Math.random()).join(''));
  }
  
  onLengthChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.length.set(Number(value));
    this.generatePassword();
  }

  onOptionChange() {
    // A slight delay to allow the signal to update before regenerating
    setTimeout(() => this.generatePassword(), 0);
  }

  copyToClipboard() {
    if (!this.generatedPassword()) return;
    navigator.clipboard.writeText(this.generatedPassword()).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar'), 2000);
    });
  }
}