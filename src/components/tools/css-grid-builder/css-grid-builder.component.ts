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
  numCols = signal(4);
  numRows = signal(2);

  templateCols = signal('1fr 1fr 1fr 1fr');
  templateRows = signal('100px 100px');

  colGap = signal(16);
  rowGap = signal(16);

  copyButtonText = signal('Copiar CSS');

  infoSections: InfoSection[] = [
    {
        title: 'Introdução e Valor da Ferramenta',
        content: `
            <h4>O que é o Construtor de Grid CSS?</h4>
            <p>Esta ferramenta é um assistente visual para a criação de layouts complexos usando CSS Grid. Ela permite definir o número de colunas e linhas, ajustar seus tamanhos e espaçamentos, e gera instantaneamente o código CSS para o seu container de grid. É a maneira mais rápida de prototipar e construir a estrutura de uma página ou componente.</p>
            
            <h4>Por que usar CSS Grid?</h4>
            <p>CSS Grid é um sistema de layout bidimensional que revolucionou a forma como construímos layouts na web. Ao contrário do Flexbox, que é principalmente unidimensional, o Grid se destaca no gerenciamento de colunas e linhas simultaneamente. Use-o para:</p>
            <ul>
                <li>Criar layouts de página inteira (cabeçalho, rodapé, barra lateral, conteúdo).</li>
                <li>Organizar galerias de imagens ou cards de produtos de forma alinhada e responsiva.</li>
                <li>Construir layouts complexos que antes exigiriam hacks ou frameworks pesados.</li>
            </ul>

            <h4>Características ⚡️</h4>
            <ul>
                <li><strong>Controle Bidimensional:</strong> Defina o número de colunas e linhas com facilidade.</li>
                <li><strong>Unidades Flexíveis:</strong> Use unidades como <code>fr</code> (fração), <code>px</code>, <code>%</code> e <code>auto</code> para definir o tamanho das trilhas.</li>
                <li><strong>Espaçamento (Gap):</strong> Controle o espaçamento entre colunas e linhas com sliders intuitivos.</li>
                <li><strong>Visualização em Tempo Real:</strong> Veja seu grid tomar forma instantaneamente na área de pré-visualização.</li>
                <li><strong>Geração de Código Limpo:</strong> Obtenha um código CSS claro e pronto para ser copiado.</li>
            </ul>
        `
    },
    {
        title: 'Guia de Uso e Exemplos',
        content: `
            <h4>Como Usar o Construtor de Grid</h4>
            <ol>
                <li><strong>Defina as Dimensões:</strong> Use os campos 'Colunas' e 'Linhas' para definir a estrutura básica do seu grid. A pré-visualização e os campos de template serão atualizados automaticamente.</li>
                <li><strong>Ajuste os Templates:</strong> Modifique os campos <code>grid-template-columns</code> e <code>grid-template-rows</code>. Experimente diferentes unidades. Por exemplo, <code>1fr 2fr</code> cria duas colunas, onde a segunda é duas vezes maior que a primeira.</li>
                <li><strong>Defina os Espaçamentos:</strong> Use os sliders para ajustar <code>column-gap</code> e <code>row-gap</code>, o espaço entre os itens do grid.</li>
                <li><strong>Copie o CSS:</strong> Pegue o código gerado na caixa de "Código CSS" e aplique-o à classe do seu container principal no seu projeto.</li>
            </ol>

            <h4>Exemplo: Layout "Holy Grail"</h4>
            <p>Para um layout clássico com cabeçalho, rodapé, conteúdo principal e duas barras laterais, você poderia usar:</p>
            <pre><code>.holy-grail-layout {
  display: grid;
  grid-template-columns: 150px 1fr 150px;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  min-height: 100vh;
}
.header { grid-column: 1 / 4; }
.nav { grid-column: 1 / 2; }
.main { grid-column: 2 / 3; }
.ads { grid-column: 3 / 4; }
.footer { grid-column: 1 / 4; }
</code></pre>
            <p>Esta ferramenta te ajuda a gerar a classe principal <code>.holy-grail-layout</code>.</p>
        `
    },
    {
        title: 'Melhores Práticas e Contexto Técnico',
        content: `
            <h4>Grid vs. Flexbox: Quando usar cada um?</h4>
            <ul>
                <li>Use <strong>Grid</strong> para o layout geral da página ou para layouts bidimensionais complexos (linhas E colunas).</li>
                <li>Use <strong>Flexbox</strong> para alinhar itens em uma única direção (uma linha OU uma coluna), como itens de um menu de navegação ou os elementos dentro de um card.</li>
                <li>Eles não são mutuamente exclusivos! É muito comum ter um item de Grid que é, ele mesmo, um container Flexbox.</li>
            </ul>
            
            <h4>Entendendo a Unidade <code>fr</code></h4>
            <p>A unidade <code>fr</code> (fração) representa uma fração do espaço disponível no container do grid. Se você tem <code>grid-template-columns: 1fr 2fr;</code>, o espaço disponível é dividido em 3 partes, com a primeira coluna ocupando 1 parte e a segunda ocupando 2.</p>
        `
    },
    {
        title: 'Perguntas Frequentes (FAQ)',
        content: `
            <h4>Como faço para um item ocupar mais de uma coluna ou linha?</h4>
            <p>Você precisa aplicar propriedades CSS diretamente ao item do grid (o filho), como <code>grid-column: span 2;</code> (para ocupar duas colunas) ou <code>grid-row-start: 1; grid-row-end: 3;</code>. Esta ferramenta foca na configuração do container pai.</p>

            <h4>Como tornar o grid responsivo?</h4>
            <p>A abordagem mais moderna é usar a função <code>repeat()</code> com <code>auto-fit</code> e <code>minmax()</code>. Por exemplo: <code>grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));</code>. Isso cria quantas colunas de no mínimo 250px couberem no container, distribuindo o espaço restante igualmente.</p>
            
            <h4>Posso nomear áreas do grid?</h4>
            <p>Sim! A propriedade <code>grid-template-areas</code> é extremamente poderosa para criar layouts semânticos. No entanto, para manter a simplicidade, esta ferramenta visual foca em <code>grid-template-columns</code> e <code>grid-template-rows</code>.</p>
        `
    }
];

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