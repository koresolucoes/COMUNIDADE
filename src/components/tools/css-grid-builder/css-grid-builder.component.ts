import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, viewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolInfoSectionComponent, InfoSection } from '../../shared/tool-info-section/tool-info-section.component';

interface GridItem {
  id: number;
  colStart: number;
  rowStart: number;
  colEnd: number;
  rowEnd: number;
  color: string;
}

interface ResizeState {
  active: boolean;
  itemId: number | null;
  itemInitialState: GridItem | null;
}

@Component({
  selector: 'app-css-grid-builder',
  standalone: true,
  imports: [FormsModule, CommonModule, ToolInfoSectionComponent],
  templateUrl: './css-grid-builder.component.html',
  styleUrls: ['./css-grid-builder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssGridBuilderComponent {
  gridContainer = viewChild<ElementRef<HTMLDivElement>>('gridContainer');
  
  cols = signal(12);
  rows = signal(8);
  gap = signal(10);

  items = signal<GridItem[]>([]);

  private resizeState = signal<ResizeState>({
    active: false,
    itemId: null,
    itemInitialState: null,
  });

  previewSpan = signal<{ colEnd: number; rowEnd: number } | null>(null);

  private colors = [
    '#3b82f6', '#10b981', '#f97316', '#ec4899', 
    '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'
  ];
  
  cellArray = computed(() => {
    return Array.from({ length: this.cols() * this.rows() });
  });

  cssCode = computed(() => {
    if (this.items().length === 0) {
      return `.parent {\n  display: grid;\n  grid-template-columns: repeat(${this.cols()}, 1fr);\n  grid-template-rows: repeat(${this.rows()}, 1fr);\n  gap: ${this.gap()}px;\n}`;
    }
    let css = `.parent {\n  display: grid;\n  grid-template-columns: repeat(${this.cols()}, 1fr);\n  grid-template-rows: repeat(${this.rows()}, 1fr);\n  gap: ${this.gap()}px;\n}\n\n`;
    for (const item of this.items()) {
      css += `.item-${item.id} {\n  grid-column: ${item.colStart} / ${item.colEnd};\n  grid-row: ${item.rowStart} / ${item.rowEnd};\n}\n\n`;
    }
    return css.trim();
  });

  htmlCode = computed(() => {
    if (this.items().length === 0) {
      return '<div class="parent">\n  <!-- Seus itens aqui -->\n</div>';
    }
    let html = '<div class="parent">\n';
    for (const item of this.items()) {
      html += `  <div class="item-${item.id}">${item.id}</div>\n`;
    }
    html += '</div>';
    return html;
  });

  infoSections = computed<InfoSection[]>(() => [
    {
      title: 'O que é o Construtor de Grid Interativo?',
      content: `
        <p>Esta é uma ferramenta totalmente visual e interativa para prototipar layouts com <strong>CSS Grid</strong>. Em vez de escrever código, você pode "desenhar" seu grid clicando para adicionar itens e arrastando para redimensioná-los. O código HTML e CSS correspondente é gerado em tempo real, pronto para ser copiado.</p>
        <h4>Características Principais ⚡️</h4>
        <ul>
            <li><strong>Criação Visual:</strong> Clique em qualquer célula vazia (+) para adicionar um novo item ao grid.</li>
            <li><strong>Redimensionamento por Arraste:</strong> Clique e arraste a alça no canto de um item para expandi-lo por múltiplas colunas e linhas.</li>
            <li><strong>Geração de Código Instantânea:</strong> O HTML e o CSS são atualizados a cada ação, refletindo exatamente o seu layout visual.</li>
            <li><strong>Controle da Estrutura:</strong> Defina facilmente o número de colunas, linhas e o espaçamento (gap) da sua grade.</li>
        </ul>
      `
    },
    {
      title: 'Guia de Uso Rápido',
      content: `
        <ol>
          <li><strong>Defina a Grade:</strong> Use os seletores no topo para configurar o número de <strong>colunas</strong> e <strong>linhas</strong> da sua área de trabalho.</li>
          <li><strong>Adicione um Item:</strong> Clique em qualquer célula com um ícone de <strong>+</strong>. Um novo item de grid aparecerá naquela posição.</li>
          <li><strong>Redimensione o Item:</strong> Cada item possui uma alça no canto inferior direito. Clique e arraste esta alça sobre as células vizinhas para expandir o item. A pré-visualização mostrará a área que ele ocupará.</li>
          <li><strong>Remova um Item:</strong> Clique no ícone de <strong>X</strong> no canto superior direito de qualquer item para removê-lo.</li>
          <li><strong>Copie o Código:</strong> O código nas caixas de "HTML Gerado" e "CSS Gerado" está sempre sincronizado com sua pré-visualização.</li>
        </ol>
      `
    },
    {
      title: 'Perguntas Frequentes (FAQ)',
      content: `
        <h4>Por que o CSS usa <code>grid-column: start / end</code>?</h4>
        <p>A ferramenta gera o código usando a sintaxe de linha de início e fim (ex: <code>grid-column: 1 / 3;</code>) porque é a forma mais explícita e robusta de definir o posicionamento de um item no grid. Isso evita ambiguidades e garante que o layout seja exatamente como o visualizado, sendo fácil de entender e manter.</p>

        <h4>Posso criar layouts complexos?</h4>
        <p>Sim! A ferramenta foi projetada para permitir a criação de qualquer layout de grid 2D, desde simples galerias até layouts de página complexos. A sobreposição de itens não é suportada diretamente pela UI para manter a simplicidade, mas você pode ajustar o CSS gerado manualmente se precisar.</p>
        
        <h4>Como a ferramenta lida com responsividade?</h4>
        <p>O CSS gerado usa unidades <code>fr</code> (fração), que são inerentemente flexíveis. Para designs responsivos mais avançados, você pode usar o código gerado como ponto de partida dentro de suas media queries (ex: <code>@media (max-width: 768px) { ... }</code>) para redefinir o posicionamento dos itens em telas menores.</p>
      `
    }
  ]);

  getColRowFromIndex(index: number): { col: number; row: number } {
    const col = (index % this.cols()) + 1;
    const row = Math.floor(index / this.cols()) + 1;
    return { col, row };
  }
  
  addItem(index: number) {
    const { col, row } = this.getColRowFromIndex(index);
    
    // Check if the cell is already occupied
    for (const item of this.items()) {
      if (
        row >= item.rowStart && row < item.rowEnd &&
        col >= item.colStart && col < item.colEnd
      ) {
        return; 
      }
    }
    
    const existingIds = this.items().map(item => item.id).sort((a, b) => a - b);
    let newId = 1;
    for (const id of existingIds) {
      if (id === newId) {
        newId++;
      } else {
        break;
      }
    }

    const colorIndex = (newId - 1) % this.colors.length;
    const newColor = this.colors[colorIndex];

    this.items.update(items => [
      ...items,
      { id: newId, colStart: col, rowStart: row, colEnd: col + 1, rowEnd: row + 1, color: newColor }
    ]);
  }

  removeItem(id: number) {
    this.items.update(items => items.filter(item => item.id !== id));
  }
  
  resetGrid() {
    this.items.set([]);
  }

  loadHolyGrail() {
    this.cols.set(5);
    this.rows.set(4);
    this.gap.set(10);
    this.items.set([
        { id: 1, colStart: 1, rowStart: 1, colEnd: 6, rowEnd: 2, color: this.colors[0] }, // Header
        { id: 2, colStart: 1, rowStart: 2, colEnd: 2, rowEnd: 4, color: this.colors[1] }, // Nav
        { id: 3, colStart: 2, rowStart: 2, colEnd: 5, rowEnd: 4, color: this.colors[2] }, // Main
        { id: 4, colStart: 5, rowStart: 2, colEnd: 6, rowEnd: 4, color: this.colors[3] }, // Aside
        { id: 5, colStart: 1, rowStart: 4, colEnd: 6, rowEnd: 5, color: this.colors[4] }, // Footer
    ]);
  }
  
  onResizeStart(event: MouseEvent, item: GridItem) {
    event.preventDefault();
    this.resizeState.set({
      active: true,
      itemId: item.id,
      itemInitialState: { ...item }
    });
  }

  @HostListener('window:mousemove', ['$event'])
  onGridMouseMove(event: MouseEvent) {
    if (!this.resizeState().active) return;

    const currentCell = this.getCellFromEvent(event);
    const initialState = this.resizeState().itemInitialState;
    if (!currentCell || !initialState) return;

    // cell col/row are 0-indexed, grid lines are 1-indexed
    // colEnd/rowEnd are exclusive
    const colEnd = Math.max(initialState.colStart + 1, currentCell.col + 2);
    const rowEnd = Math.max(initialState.rowStart + 1, currentCell.row + 2);

    this.previewSpan.set({ colEnd, rowEnd });
  }

  @HostListener('window:mouseup', ['$event'])
  onGridMouseUp(event: MouseEvent) {
    if (!this.resizeState().active) return;

    const finalSpan = this.previewSpan();
    const itemId = this.resizeState().itemId;

    if (finalSpan && itemId !== null) {
      this.items.update(items =>
        items.map(item =>
          item.id === itemId
            ? { ...item, colEnd: finalSpan.colEnd, rowEnd: finalSpan.rowEnd }
            : item
        )
      );
    }
    
    this.resizeState.set({ active: false, itemId: null, itemInitialState: null });
    this.previewSpan.set(null);
  }

  private getCellFromEvent(event: MouseEvent): { col: number; row: number } | null {
    const container = this.gridContainer()?.nativeElement;
    if (!container) return null;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / (rect.width / this.cols()));
    const row = Math.floor(y / (rect.height / this.rows()));

    if (col < 0 || col >= this.cols() || row < 0 || row >= this.rows()) {
        return null;
    }

    return { col, row };
  }
}