
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pandas-intro',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './pandas-intro.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PandasIntroComponent {
  // DataFrame Simulator Data
  fullData = [
    { id: 1, produto: 'Notebook', preco: 3500, estoque: 10 },
    { id: 2, produto: 'Mouse', preco: 50, estoque: 150 },
    { id: 3, produto: 'Teclado', preco: 120, estoque: 80 },
    { id: 4, produto: 'Monitor', preco: 800, estoque: 30 },
    { id: 5, produto: 'Cabo HDMI', preco: 25, estoque: 200 },
    { id: 6, produto: 'Webcam', preco: 150, estoque: 45 },
  ];

  activeView = signal<'head' | 'all' | 'describe'>('head');

  displayedData = computed(() => {
    if (this.activeView() === 'head') {
        return this.fullData.slice(0, 3); // Simulate head(3)
    }
    return this.fullData;
  });

  describeData = [
    { metric: 'count', id: 6, preco: 6, estoque: 6 },
    { metric: 'mean', id: 3.5, preco: 774.16, estoque: 85.8 },
    { metric: 'min', id: 1, preco: 25, estoque: 10 },
    { metric: 'max', id: 6, preco: 3500, estoque: 200 },
  ];

  currentCommand = computed(() => {
    switch(this.activeView()) {
        case 'head': return 'df.head(3)';
        case 'all': return 'df';
        case 'describe': return 'df.describe()';
        default: return 'df';
    }
  });
}
