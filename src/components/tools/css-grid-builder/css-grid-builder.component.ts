import { Component, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolInfoSectionComponent, InfoSection } from '../../shared/tool-info-section/tool-info-section.component';

interface TrackSize {
  value: number;
  unit: string;
}

interface ItemConfig {
  colSpan: number;
  rowSpan: number;
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
  // --- Grid Settings ---
  private readonly initialColumns = 4;
  private readonly initialRows = 3;
  private readonly initialGap = 16;
  private readonly initialItemCount = 12;

  columns = signal(this.initialColumns);
  rows = signal(this.initialRows);
  columnGap = signal(this.initialGap);
  rowGap = signal(this.initialGap);
  
  units = ['fr', 'px', '%', 'auto'];

  columnTracks = signal<TrackSize[]>(Array(this.initialColumns).fill(null).map(() => ({ value: 1, unit: 'fr' })));
  rowTracks = signal<TrackSize[]>(Array(this.initialRows).fill(null).map(() => ({ value: 1, unit: 'auto' })));

  // --- Grid Items ---
  itemCount = signal(this.initialItemCount);
  selectedItemIndex = signal<number | null>(0);
  itemConfigs = signal<ItemConfig[]>(Array(this.initialItemCount).fill(null).map(() => ({ colSpan: 1, rowSpan: 1 })));

  // --- UI State ---
  containerCopyText = signal('Copiar CSS do Contêiner');
  itemCopyText = signal('Copiar CSS do Item');

  infoSections: InfoSection[] = [
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
                <li><strong>Dimensione as Trilhas:</strong> Selecione o valor e a unidade para cada coluna e linha.</li>
                <li><strong>Visualize e Expanda:</strong> Adicione ou remova itens para ver como eles se encaixam na grade. Clique em um item para selecioná-lo e use os controles de 'Expandir' para fazê-lo ocupar mais de uma célula (span).</li>
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
    },
    {
      title: 'Exemplos Prontos para Copiar',
      content: `
        <h4>Layouts Comuns de Grid</h4>
        <p>Use estes exemplos como ponto de partida para seus projetos. Clique para copiar o código CSS do contêiner.</p>
        <div class="presets-grid">
            <div class="preset-card">
                <h5>Layout de Cards Responsivo</h5>
                <p class="text-xs text-gray-400 mb-2">Cria colunas que se ajustam automaticamente ao espaço disponível.</p>
                <div class="preset-preview-wrapper" style="padding: 8px;">
                    <div style="width: 100%; height: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(50px, 1fr)); gap: 8px; font-size: 0.75rem; color: white;">
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: center;">1</div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: center;">2</div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: center;">3</div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: center;">4</div>
                    </div>
                </div>
                <div class="code-wrapper">
                    <pre><code>display: grid;
grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
gap: 1rem;</code></pre>
                    <button class="copy-button" data-copy-code="display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\ngap: 1rem;">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Layout "Holy Grail"</h5>
                <p class="text-xs text-gray-400 mb-2">Um layout clássico com cabeçalho, rodapé, conteúdo principal e barras laterais.</p>
                <div class="preset-preview-wrapper" style="padding: 8px;">
                    <div style="width: 100%; height: 100%; display: grid; grid-template-areas: 'header header header' 'nav main aside' 'footer footer footer'; grid-template-rows: 25px 1fr 25px; grid-template-columns: 1fr 3fr 1fr; gap: 5px; font-size: 0.7rem; color: white;">
                        <div style="grid-area: header; background-color: rgba(88, 166, 255, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: center;">Header</div>
                        <div style="grid-area: nav; background-color: rgba(88, 166, 255, 0.2); border-radius: 4px; display: flex; align-items: center; justify-content: center;">Nav</div>
                        <div style="grid-area: main; background-color: rgba(88, 166, 255, 0.4); border-radius: 4px; display: flex; align-items: center; justify-content: center;">Main</div>
                        <div style="grid-area: aside; background-color: rgba(88, 166, 255, 0.2); border-radius: 4px; display: flex; align-items: center; justify-content: center;">Aside</div>
                        <div style="grid-area: footer; background-color: rgba(88, 166, 255, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: center;">Footer</div>
                    </div>
                </div>
                <div class="code-wrapper">
                    <pre><code>display: grid;
grid-template-areas:
  'header header header'
  'nav    main   aside'
  'footer footer footer';
grid-template-rows: auto 1fr auto;
grid-template-columns: 150px 1fr 150px;
gap: 10px;</code></pre>
                    <button class="copy-button" data-copy-code="display: grid;\ngrid-template-areas:\n  'header header header'\n  'nav    main   aside'\n  'footer footer footer';\ngrid-template-rows: auto 1fr auto;\ngrid-template-columns: 150px 1fr 150px;\ngap: 10px;">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Layout Clássico de 12 Colunas</h5>
                <p class="text-xs text-gray-400 mb-2">Uma base para layouts de página, dividindo o espaço em 12 colunas flexíveis.</p>
                <div class="preset-preview-wrapper" style="padding: 8px;">
                    <div style="width: 100%; height: 60px; display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px;">
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                        <div style="background-color: rgba(88, 166, 255, 0.3); border-radius: 2px;"></div>
                    </div>
                </div>
                <div class="code-wrapper">
                    <pre><code>display: grid;
grid-template-columns: repeat(12, 1fr);
gap: 1rem;</code></pre>
                    <button class="copy-button" data-copy-code="display: grid;\ngrid-template-columns: repeat(12, 1fr);\ngap: 1rem;">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Estrutura de Dashboard</h5>
                <p class="text-xs text-gray-400 mb-2">Um layout comum para aplicações, com uma barra lateral fixa e conteúdo principal.</p>
                <div class="preset-preview-wrapper" style="padding: 8px;">
                    <div style="width: 100%; height: 100%; display: grid; grid-template-columns: 80px 1fr; grid-template-rows: 40px 1fr; grid-template-areas: 'sidebar header' 'sidebar main'; gap: 5px; font-size: 0.7rem; color: white;">
                        <div style="grid-area: sidebar; background-color: rgba(88, 166, 255, 0.2); border-radius: 4px; display: flex; align-items: center; justify-content: center;">Sidebar</div>
                        <div style="grid-area: header; background-color: rgba(88, 166, 255, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: center;">Header</div>
                        <div style="grid-area: main; background-color: rgba(88, 166, 255, 0.4); border-radius: 4px; display: flex; align-items: center; justify-content: center;">Main</div>
                    </div>
                </div>
                <div class="code-wrapper">
                    <pre><code>.container {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
}
/* Itens: .sidebar { grid-area: sidebar; } ... */</code></pre>
                    <button class="copy-button" data-copy-code="display: grid;\ngrid-template-columns: 200px 1fr;\ngrid-template-rows: auto 1fr;\ngrid-template-areas:\n  'sidebar header'\n  'sidebar main';">Copiar</button>
                </div>
            </div>
        </div>
      `
    }
    ];

  constructor() {
     effect(() => {
        const count = this.itemCount();
        this.itemConfigs.update(configs => {
            const newConfigs = [...configs];
            const diff = count - newConfigs.length;
            if (diff > 0) {
                for (let i = 0; i < diff; i++) newConfigs.push({ colSpan: 1, rowSpan: 1 });
            } else if (diff < 0) {
                newConfigs.length = count;
            }
            if (this.selectedItemIndex() !== null && this.selectedItemIndex()! >= count) {
                this.selectedItemIndex.set(count > 0 ? 0 : null);
            }
            return newConfigs;
        });
    }, { allowSignalWrites: true });
  }

  // --- Computed CSS ---
  gridContainerStyle = computed(() => {
    const formatTracks = (tracks: TrackSize[]) => tracks.map(t => t.unit === 'auto' ? 'auto' : `${t.value}${t.unit}`).join(' ');
    
    const style: { [key: string]: string } = {
      'display': 'grid',
      'grid-template-columns': formatTracks(this.columnTracks()),
      'grid-template-rows': formatTracks(this.rowTracks()),
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
  
  selectedItem = computed(() => {
    const index = this.selectedItemIndex();
    if (index === null) return null;
    return this.itemConfigs()[index];
  });
  
  selectedItemCssText = computed(() => {
    const index = this.selectedItemIndex();
    const itemConfig = this.selectedItem();
    if (index === null || !itemConfig) {
      return '.grid-item {\n  /* Clique em um item para ver seu CSS */\n}';
    }

    let css = `.grid-item-${index + 1} {\n`;
    if (itemConfig.colSpan > 1) {
      css += `  grid-column: span ${itemConfig.colSpan};\n`;
    }
    if (itemConfig.rowSpan > 1) {
      css += `  grid-row: span ${itemConfig.rowSpan};\n`;
    }
    if (itemConfig.colSpan <= 1 && itemConfig.rowSpan <= 1) {
      css += '  /* Sem regras de span */\n';
    }
    css += '}';
    return css;
  });
  
  items = computed(() => Array.from({ length: this.itemCount() }, (_, i) => i));

  updateColumns(count: number | null): void {
    const newCount = count || 1;
    if (isNaN(newCount) || newCount < 1) return;
    this.columns.set(newCount);
    this.columnTracks.update(values => this.adjustArray(values, newCount, { value: 1, unit: 'fr' }));
  }

  updateRows(count: number | null): void {
    const newCount = count || 1;
    if (isNaN(newCount) || newCount < 1) return;
    this.rows.set(newCount);
    this.rowTracks.update(values => this.adjustArray(values, newCount, { value: 1, unit: 'auto' }));
  }

  private adjustArray<T>(arr: T[], count: number, fillValue: T): T[] {
    const newArr = [...arr];
    const diff = count - newArr.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) newArr.push(fillValue);
    } else if (diff < 0) {
      newArr.length = count;
    }
    return newArr;
  }

  updateTrack(type: 'column' | 'row', index: number, part: 'value' | 'unit', value: string | number) {
    const signalToUpdate = type === 'column' ? this.columnTracks : this.rowTracks;
    signalToUpdate.update(tracks => {
      const newTracks = JSON.parse(JSON.stringify(tracks));
      const trackToUpdate = newTracks[index];
      
      if (part === 'value' && typeof value === 'number') {
        trackToUpdate.value = value;
      } else if (part === 'unit' && typeof value === 'string') {
        trackToUpdate.unit = value;
      }
      
      return newTracks;
    });
  }
  
  updateItemSpan(part: 'colSpan' | 'rowSpan', value: number | null) {
    const index = this.selectedItemIndex();
    if (index === null || value === null || isNaN(value)) return;
    
    this.itemConfigs.update(configs => {
        const newConfigs = [...configs];
        const newConfig = { ...newConfigs[index] };
        newConfig[part] = Math.max(1, value);
        newConfigs[index] = newConfig;
        return newConfigs;
    });
  }

  getItemStyle(index: number) {
    const config = this.itemConfigs()[index];
    if (!config) return {};
    return {
        'grid-column-end': `span ${config.colSpan}`,
        'grid-row-end': `span ${config.rowSpan}`,
    };
  }

  addItem(): void {
    this.itemCount.update(c => c + 1);
  }

  removeItem(): void {
    this.itemCount.update(c => Math.max(0, c - 1));
  }

  selectItem(index: number): void {
    if (this.selectedItemIndex() === index) {
      this.selectedItemIndex.set(null);
    } else {
      this.selectedItemIndex.set(index);
    }
  }
  
  trackByIndex(index: number): number {
    return index;
  }
  
  resetLayout(): void {
    this.columns.set(this.initialColumns);
    this.rows.set(this.initialRows);
    this.columnGap.set(this.initialGap);
    this.rowGap.set(this.initialGap);
    
    this.columnTracks.set(Array(this.initialColumns).fill(null).map(() => ({ value: 1, unit: 'fr' })));
    this.rowTracks.set(Array(this.initialRows).fill(null).map(() => ({ value: 1, unit: 'auto' })));
    
    this.itemCount.set(this.initialItemCount);
    this.itemConfigs.set(Array(this.initialItemCount).fill(null).map(() => ({ colSpan: 1, rowSpan: 1 })));
    this.selectedItemIndex.set(0);
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
