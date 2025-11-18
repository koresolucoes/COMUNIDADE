
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cores-e-contraste',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './cores-e-contraste.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoresEContrasteComponent {
  // --- Playground 1: Psicologia/Semântica ---
  serverStatus = signal<'online' | 'error' | 'warning' | 'maintenance'>('online');

  // --- Playground 2: Contraste ---
  bgLightness = signal(50); // 0 (preto) a 100 (branco)
  textLightness = signal(50); // Começa com baixo contraste propositalmente

  contrastScore = computed(() => {
    const diff = Math.abs(this.bgLightness() - this.textLightness());
    if (diff < 30) return { label: 'Ilegível (Fail)', color: 'text-red-500', icon: 'cancel' };
    if (diff < 50) return { label: 'Razoável (AA)', color: 'text-yellow-400', icon: 'warning' };
    return { label: 'Excelente (AAA)', color: 'text-green-500', icon: 'check_circle' };
  });

  // --- Playground 3: Regra 60-30-10 ---
  color60 = signal('#111827'); // gray-900
  color30 = signal('#1f2937'); // gray-800
  color10 = signal('#3b82f6'); // blue-500

  // --- Desafio Final ---
  fixSemantic = signal(false);
  fixContrast = signal(false);

  isChallengeComplete = computed(() => this.fixSemantic() && this.fixContrast());

  resetChallenge() {
    this.fixSemantic.set(false);
    this.fixContrast.set(false);
  }
}
