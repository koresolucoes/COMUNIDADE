
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hierarquia-visual',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './hierarquia-visual.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HierarquiaVisualComponent {
  // --- Playground 1: Tamanho ---
  headingSize = signal(16); // Começa pequeno (ruim) para o usuário ajustar
  
  // --- Playground 2: Cor ---
  useAccentColor = signal(false);

  // --- Playground 3: Espaçamento ---
  spacingLevel = signal(0); // 0 = apertado, 1 = médio, 2 = espaçoso

  // --- Desafio Final ---
  fixType = signal(false);
  fixColor = signal(false);
  fixSpace = signal(false);

  isChallengeComplete = computed(() => 
    this.fixType() && this.fixColor() && this.fixSpace()
  );

  resetChallenge() {
    this.fixType.set(false);
    this.fixColor.set(false);
    this.fixSpace.set(false);
  }
}
