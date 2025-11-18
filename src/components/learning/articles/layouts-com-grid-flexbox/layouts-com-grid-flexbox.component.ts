
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layouts-com-grid-flexbox',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './layouts-com-grid-flexbox.component.html',
  styleUrls: ['./layouts-com-grid-flexbox.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutsComGridFlexboxComponent {
  // --- Playground Flexbox ---
  flexDirection = signal('row');
  justifyContent = signal('flex-start');
  alignItems = signal('stretch');

  // --- Playground Grid ---
  gridColumns = signal('1fr 1fr 1fr'); // 3 colunas iguais por padrão
  gridGap = signal(10);

  // --- Desafio Final: A Navbar Quebrada ---
  navJustify = signal('flex-start'); // Começa errado
  navAlign = signal('flex-start');   // Começa errado

  isNavFixed = computed(() => 
    this.navJustify() === 'space-between' && this.navAlign() === 'center'
  );

  resetChallenge() {
    this.navJustify.set('flex-start');
    this.navAlign.set('flex-start');
  }
}
