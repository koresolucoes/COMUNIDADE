
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-python-funcoes',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './python-funcoes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonFuncoesComponent {
  // Function Lab State
  valorBase = signal(100);
  taxaImposto = signal(10); // percentage

  impostoCalculado = computed(() => {
    return (this.valorBase() * (this.taxaImposto() / 100)).toFixed(2);
  });

  totalCalculado = computed(() => {
    return (this.valorBase() * (1 + this.taxaImposto() / 100)).toFixed(2);
  });
}
