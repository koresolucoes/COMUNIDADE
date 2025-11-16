import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-css-grid-builder',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './css-grid-builder.component.html',
  styleUrls: ['./css-grid-builder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssGridBuilderComponent {
  // --- Grid Settings ---
  numCols = signal(4);
  numRows = signal(2);

  templateCols = signal('1fr 1fr 1fr 1fr');
  templateRows = signal('100px 100px');

  colGap = signal(16);
  rowGap = signal(16);

  copyButtonText = signal('Copiar CSS');

  // --- Computed properties ---
  gridItems = computed(() => {
    const count = this.numCols() * this.numRows();
    return Array.from({ length: count }, (_, i) => i + 1);
  });
  
  gridContainerStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: this.templateCols(),
    gridTemplateRows: this.templateRows(),
    gridColumnGap: `${this.colGap()}px`,
    gridRowGap: `${this.rowGap()}px`,
  }));

  generatedCss = computed(() => {
    return `
.grid-container {
  display: grid;
  grid-template-columns: ${this.templateCols()};
  grid-template-rows: ${this.templateRows()};
  column-gap: ${this.colGap()}px;
  row-gap: ${this.rowGap()}px;
}
    `.trim();
  });
  
  // --- Methods ---
  
  updateNumCols(value: number) {
    const count = Math.max(1, value);
    this.numCols.set(count);
    this.templateCols.set(Array(count).fill('1fr').join(' '));
  }
  
  updateNumRows(value: number) {
    const count = Math.max(1, value);
    this.numRows.set(count);
    this.templateRows.set(Array(count).fill('100px').join(' '));
  }

  copyCss(): void {
    navigator.clipboard.writeText(this.generatedCss()).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar CSS'), 2000);
    });
  }
}
