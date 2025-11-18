
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fundos-impactantes-gradientes',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './fundos-impactantes-gradientes.component.html',
  styleUrls: ['./fundos-impactantes-gradientes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundosImpactantesGradientesComponent {
  // --- Playground 1: Linear ---
  linearAngle = signal(45);
  linearColor1 = signal('#58a6ff');
  linearColor2 = signal('#3fb950');

  linearStyle = computed(() => {
    return `linear-gradient(${this.linearAngle()}deg, ${this.linearColor1()}, ${this.linearColor2()})`;
  });

  // --- Playground 2: Radial ---
  radialShape = signal<'circle' | 'ellipse'>('circle');
  radialPosition = signal('center');
  radialColor1 = signal('#ff5858');
  radialColor2 = signal('#0d1117');

  radialStyle = computed(() => {
    return `radial-gradient(${this.radialShape()} at ${this.radialPosition()}, ${this.radialColor1()}, ${this.radialColor2()})`;
  });

  // --- Desafio Final ---
  heroDirection = signal(false); // false = to right, true = 135deg
  heroColor = signal(false); // false = single color, true = gradient
  heroOverlay = signal(false); // false = none, true = subtle texture/overlay

  isChallengeComplete = computed(() => this.heroDirection() && this.heroColor() && this.heroOverlay());

  resetChallenge() {
    this.heroDirection.set(false);
    this.heroColor.set(false);
    this.heroOverlay.set(false);
  }
}
