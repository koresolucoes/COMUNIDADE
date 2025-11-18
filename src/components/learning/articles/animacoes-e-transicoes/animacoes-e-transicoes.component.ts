
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-animacoes-e-transicoes',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './animacoes-e-transicoes.component.html',
  styleUrls: ['./animacoes-e-transicoes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimacoesETransicoesComponent {
  // --- Playground 1: Transições ---
  transitionDuration = signal(0.3);
  transitionTiming = signal('ease-out');
  
  // --- Playground 2: Keyframes (Like Button) ---
  isLiked = signal(false);
  isAnimatingLike = signal(false);

  toggleLike() {
    // Evita spam de cliques durante a animação
    if (this.isAnimatingLike()) return;
    
    this.isLiked.update(v => !v);
    
    // Se curtiu, dispara a animação
    if (this.isLiked()) {
        this.isAnimatingLike.set(true);
        setTimeout(() => {
          this.isAnimatingLike.set(false);
        }, 1000); // Tempo suficiente para a animação CSS terminar
    }
  }

  // --- Playground 3: SVG Drawing ---
  // O comprimento total do path do SVG (aproximado para o exemplo visual)
  pathLength = 300; 
  drawProgress = signal(0); // 0 a 100%

  svgDashOffset = computed(() => {
    // Offset vai de pathLength (invisível) a 0 (totalmente visível)
    // Quando progress é 0, offset é 300 (escondido)
    // Quando progress é 100, offset é 0 (visível)
    return this.pathLength - (this.pathLength * this.drawProgress() / 100);
  });

  // --- Desafio Final: Morphing Button ---
  buttonState = signal<'idle' | 'loading' | 'success'>('idle');

  startProcess() {
    if (this.buttonState() !== 'idle') return;

    // Estado 1: Carregando (Botão encolhe e mostra spinner)
    this.buttonState.set('loading');

    // Simula uma requisição de rede (2.5 segundos)
    setTimeout(() => {
      // Estado 2: Sucesso (Botão fica verde e desenha check)
      this.buttonState.set('success');
      
      // Reseta após um tempo para o usuário brincar de novo
      setTimeout(() => {
        this.buttonState.set('idle');
      }, 3000);
    }, 2500);
  }
}
