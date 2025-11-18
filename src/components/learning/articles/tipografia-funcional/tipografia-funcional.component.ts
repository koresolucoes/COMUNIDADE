
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tipografia-funcional',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './tipografia-funcional.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipografiaFuncionalComponent {
  // --- Playground 1: Famílias de Fontes ---
  // 'sans' | 'serif' | 'mono'
  selectedFamily = signal('sans');

  // --- Playground 2: Legibilidade (Line Height & Width) ---
  lineHeight = signal(1.0); // Começa ruim (muito apertado)
  lineWidth = signal(100); // % de largura (começa muito largo)

  // --- Playground 3: Hierarquia (Escala) ---
  titleWeight = signal('bold');
  titleSize = signal(24);
  bodySize = signal(16);

  // --- Desafio Final: O Log Ilegível ---
  fixFont = signal(false); // De Serif para Mono
  fixSize = signal(false); // De 10px para 14px
  fixHeight = signal(false); // De 1.0 para 1.5

  isChallengeComplete = computed(() => 
    this.fixFont() && this.fixSize() && this.fixHeight()
  );

  resetChallenge() {
    this.fixFont.set(false);
    this.fixSize.set(false);
    this.fixHeight.set(false);
  }

  getFontFamilyClass(type: string): string {
    switch(type) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  }
}
