
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sklearn-feature-engineering',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sklearn-feature-engineering.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SklearnFeatureEngineeringComponent {
  // --- One-Hot Encoding Lab ---
  oneHotEncoded = signal(false);

  oneHotBefore = [
    { cor: 'vermelho' },
    { cor: 'verde' },
    { cor: 'azul' },
    { cor: 'vermelho' },
  ];

  oneHotAfter = [
    { cor_azul: 0, cor_verde: 0, cor_vermelho: 1 },
    { cor_azul: 0, cor_verde: 1, cor_vermelho: 0 },
    { cor_azul: 1, cor_verde: 0, cor_vermelho: 0 },
    { cor_azul: 0, cor_verde: 0, cor_vermelho: 1 },
  ];

  // --- Standardization Lab ---
  standardized = signal(false);
  
  standardBefore = [
    { idade: 25, salario: 50000 },
    { idade: 40, salario: 80000 },
    { idade: 65, salario: 120000 },
  ];

  standardAfter = [
    { idade: -1.06, salario: -0.98 },
    { idade: -0.26, salario: -0.24 },
    { idade: 1.32, salario: 1.22 },
  ];
}
