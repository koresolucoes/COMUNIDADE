
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-formas-com-clip-path',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './formas-com-clip-path.component.html',
  styleUrls: ['./formas-com-clip-path.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormasComClipPathComponent {
  // --- Playground 1: Formas Básicas ---
  shapeType = signal<'circle' | 'ellipse' | 'inset'>('circle');
  
  // Params Circle/Ellipse
  circleRadius = signal(40); // %
  circleX = signal(50); // %
  circleY = signal(50); // %

  // Params Inset
  insetVal = signal(10); // %
  
  generatedBasicClip = computed(() => {
    switch(this.shapeType()) {
      case 'circle':
        return `circle(${this.circleRadius()}% at ${this.circleX()}% ${this.circleY()}%)`;
      case 'ellipse':
        // Para simplificar a UI, usamos o mesmo X/Y, mas achatamos um pouco o raio Y
        return `ellipse(${this.circleRadius()}% ${this.circleRadius() * 0.7}% at ${this.circleX()}% ${this.circleY()}%)`;
      case 'inset':
        return `inset(${this.insetVal()}% round 20px)`;
      default:
        return 'none';
    }
  });

  // --- Playground 2: Polígonos ---
  polyShape = signal<'triangle' | 'hexagon' | 'star' | 'message'>('triangle');

  polyClip = computed(() => {
    switch(this.polyShape()) {
      case 'triangle': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      case 'star': return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      case 'message': return 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)';
      default: return 'none';
    }
  });

  // --- Desafio Final: Cyberpunk ID ---
  cutCorners = signal(false);
  hexAvatar = signal(false);
  revealData = signal(false);

  isChallengeComplete = computed(() => this.cutCorners() && this.hexAvatar() && this.revealData());

  resetChallenge() {
    this.cutCorners.set(false);
    this.hexAvatar.set(false);
    this.revealData.set(false);
  }
}
