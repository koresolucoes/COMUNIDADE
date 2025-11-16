import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolInfoSectionComponent, InfoSection } from '../../shared/tool-info-section/tool-info-section.component';

@Component({
  selector: 'app-css-grid-builder',
  standalone: true,
  imports: [FormsModule, CommonModule, ToolInfoSectionComponent],
  templateUrl: './css-grid-builder.component.html',
  styleUrls: ['./css-grid-builder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssGridBuilderComponent {
  // --- Grid Settings ---
  columns = signal(4);
  rows = signal(3);
  columnGap = signal(16);
  rowGap = signal(16);
  
  columnValues = signal<string[]>(Array(4).fill('1fr'));
  rowValues = signal<string[]>(Array(3).fill('auto'));

  // --- Grid Items ---
  itemCount = signal(12);
  selectedItemIndex = signal<number | null>(0);

  // --- UI State ---
  containerCopyText = signal('Copiar CSS do Contêiner');
  itemCopyText = signal('Copiar CSS do Item');

  // --- Computed CSS ---
  gridContainerStyle = computed(() => {
    const style: { [key: string]: string } = {
      'display': 'grid',
      'grid-template-columns': this.columnValues().join(' '),
      'grid-template-rows': this.rowValues().join(' '),
      'column-gap': `${this.columnGap()}px`,
      'row-gap': `${this.rowGap()}px`,
      'height': '100%',
      'width': '100%',
    };
    return style;
  });

  gridContainerCssText = computed(() => {
    const style = this.gridContainerStyle();
    return `
.grid-container {
  display: ${style['display']};
  grid-template-columns: ${style['grid-template-columns']};
  grid-template-rows: ${style['grid-template-rows']};
  column-gap: ${style['column-gap']};
  row-gap: ${style['row-gap']};
}
    `.trim();
  });
  
  selectedItemCssText = computed(() => {
    const index = this.selectedItemIndex();
    if (index === null) {
      return '.grid-item {\n  /* Clique em um item para ver seu CSS */\n}';
    }
    // Simple placeholder, could be extended to allow user to span items
    return `
.grid-item-${index + 1} {
  /* grid-column: auto / auto; */
  /* grid-row: auto / auto; */
}
    `.trim();
  });
  
  items = computed(() => Array.from({ length: this.itemCount() }, (_, i) => i));

  infoSections: InfoSection[] = [];

  constructor() {
    this.infoSections = [
    {
      title: 'Introdução e Valor da Ferramenta',
      content: `
        <h4>O que é o Construtor de Grid CSS?</h4>
        <p>Esta é uma ferramenta interativa para projetar layouts de grade (CSS Grid) visualmente. Permite que você defina colunas, linhas, espaçamentos e veja o resultado em tempo real, gerando o código CSS correspondente para o contêiner e seus itens.</p>
        
        <h4>Por que usar CSS Grid?</h4>
        <p>CSS Grid é o sistema de layout mais poderoso em CSS. É ideal para layouts de página bidimensionais (colunas e linhas ao mesmo tempo), oferecendo um controle que era impossível com hacks antigos de float ou mesmo com Flexbox para layouts complexos.</p>
        <ul>
            <li>Crie layouts complexos e responsivos com menos código.</li>
            <li>Alinhe itens em duas dimensões simultaneamente.</li>
            <li>Controle preciso sobre o posicionamento e o dimensionamento dos elementos.</li>
        </ul>
      `
    },
    {
        title: 'Guia de Uso e Unidades Comuns',
        content: `
            <h4>Como Usar o Construtor</h4>
            <ol>
                <li><strong>Defina a Estrutura:</strong> Ajuste o número de colunas e linhas.</li>
                <li><strong>Configure os Espaçamentos:</strong> Defina os valores de <code>column-gap</code> e <code>row-gap</code>.</li>
                <li><strong>Dimensione as Trilhas:</strong> Insira os valores para cada coluna e linha nos campos de texto. Use unidades como <code>fr</code>, <code>px</code>, <code>%</code>, ou <code>auto</code>.</li>
                <li><strong>Visualize:</strong> Adicione ou remova itens para ver como eles se encaixam na grade. Clique em um item para "selecioná-lo".</li>
                <li><strong>Copie o Código:</strong> Use os botões para copiar o CSS gerado para o contêiner da grade e para os itens.</li>
            </ol>
            <h4>Unidades Comuns do Grid</h4>
            <ul>
                <li><code>fr</code> (fração): Uma unidade flexível que representa uma fração do espaço livre no contêiner. <code>1fr 1fr 2fr</code> divide o espaço em 4 partes e dá 1 para as duas primeiras colunas e 2 para a terceira.</li>
                <li><code>px</code>, <code>rem</code>: Unidades de comprimento fixo.</li>
                <li><code>%</code>: Uma porcentagem do tamanho do contêiner da grade.</li>
                <li><code>auto</code>: O tamanho é determinado pelo conteúdo do item da grade ou pelo tamanho do próprio item.</li>
                <li><code>minmax(min, max)</code>: Define um intervalo de tamanho, garantindo que a trilha nunca seja menor que <code>min</code> ou maior que <code>max</code>. Ex: <code>minmax(100px, 1fr)</code>.</li>
            </ul>
        `
    }
    ];
  }

  updateColumns(count: number | null): void {
    const newCount = count || 1;
    if (isNaN(newCount) || newCount < 1) return;
    this.columns.set(newCount);
    this.columnValues.update(values => this.adjustArray(values, newCount, '1fr'));
  }

  updateRows(count: number | null): void {
    const newCount = count || 1;
    if (isNaN(newCount) || newCount < 1) return;
    this.rows.set(newCount);
    this.rowValues.update(values => this.adjustArray(values, newCount, 'auto'));
  }

  private adjustArray(arr: string[], count: number, fillValue: string): string[] {
    const newArr = [...arr];
    const diff = count - newArr.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) newArr.push(fillValue);
    } else if (diff < 0) {
      newArr.length = count;
    }
    return newArr;
  }

  updateColumnValue(index: number, value: string): void {
    this.columnValues.update(values => {
      const newValues = [...values];
      newValues[index] = value;
      return newValues;
    });
  }

  updateRowValue(index: number, value: string): void {
    this.rowValues.update(values => {
      const newValues = [...values];
      newValues[index] = value;
      return newValues;
    });
  }

  addItem(): void {
    this.itemCount.update(c => c + 1);
  }

  removeItem(): void {
    this.itemCount.update(c => Math.max(0, c - 1));
  }

  selectItem(index: number): void {
    this.selectedItemIndex.set(index);
  }
  
  trackByIndex(index: number): number {
    return index;
  }

  copyCss(type: 'container' | 'item'): void {
    const textToCopy = type === 'container' ? this.gridContainerCssText() : this.selectedItemCssText();
    const signalToUpdate = type === 'container' ? this.containerCopyText : this.itemCopyText;
    const originalText = type === 'container' ? 'Copiar CSS do Contêiner' : 'Copiar CSS do Item';

    navigator.clipboard.writeText(textToCopy).then(() => {
      signalToUpdate.set('Copiado!');
      setTimeout(() => signalToUpdate.set(originalText), 2000);
    });
  }
}