
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profundidade-com-sombras',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './profundidade-com-sombras.component.html',
  styleUrls: ['./profundidade-com-sombras.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfundidadeComSombrasComponent {
  // --- Playground 1: Anatomia da Sombra ---
  shadowX = signal(10);
  shadowY = signal(10);
  shadowBlur = signal(20);
  shadowSpread = signal(0);
  shadowOpacity = signal(0.3);

  generatedShadow = computed(() => {
    return `${this.shadowX()}px ${this.shadowY()}px ${this.shadowBlur()}px ${this.shadowSpread()}px rgba(0,0,0,${this.shadowOpacity()})`;
  });

  // --- Playground 2: Camadas (Elevação) ---
  elevationLevel = signal<'flat' | 'low' | 'high'>('flat');

  // --- Playground 3: Glassmorphism ---
  glassOpacity = signal(0.1); // 10%
  glassBlur = signal(10); // 10px
  
  glassStyle = computed(() => ({
    'background': `rgba(255, 255, 255, ${this.glassOpacity()})`,
    'backdrop-filter': `blur(${this.glassBlur()}px)`,
    '-webkit-backdrop-filter': `blur(${this.glassBlur()}px)`,
    'border': '1px solid rgba(255, 255, 255, 0.2)'
  }));

  // --- Desafio Final ---
  applyShadow = signal(false);
  applyGlass = signal(false);

  isChallengeComplete = computed(() => this.applyShadow() && this.applyGlass());

  resetChallenge() {
    this.applyShadow.set(false);
    this.applyGlass.set(false);
  }
}
