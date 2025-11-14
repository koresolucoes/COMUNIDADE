import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserDataService } from '../../../services/user-data.service';
import { ToolDataStateService } from '../../../services/tool-data-state.service';

@Component({
  selector: 'app-password-generator',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent, RouterLink],
  templateUrl: './password-generator.component.html',
  styleUrls: ['./password-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordGeneratorComponent implements OnInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  currentUser = this.authService.currentUser;
  
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
  
  ngOnInit(): void {
      const dataToLoad = this.toolDataStateService.consumeData();
      if (dataToLoad && dataToLoad.toolId === 'password-generator') {
        this.loadState(dataToLoad.data);
      }
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

  async saveData() {
    if (!this.currentUser()) {
      alert('Você precisa estar logado para salvar.');
      return;
    }
    const title = prompt('Digite um nome para salvar estas configurações de senha:', `Config de Senha - ${new Date().toLocaleDateString()}`);
    if (title) {
      const state = {
        length: this.length(),
        includeUppercase: this.includeUppercase(),
        includeLowercase: this.includeLowercase(),
        includeNumbers: this.includeNumbers(),
        includeSymbols: this.includeSymbols(),
      };
      try {
        await this.userDataService.saveData('password-generator', title, state);
        alert('Configurações salvas com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Falha ao salvar as configurações.');
      }
    }
  }

  private loadState(state: any) {
    if (!state) return;
    this.length.set(state.length ?? 24);
    this.includeUppercase.set(state.includeUppercase ?? true);
    this.includeLowercase.set(state.includeLowercase ?? true);
    this.includeNumbers.set(state.includeNumbers ?? true);
    this.includeSymbols.set(state.includeSymbols ?? true);
    this.generatePassword();
  }
}
