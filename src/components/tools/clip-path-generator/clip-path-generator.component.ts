import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolInfoSectionComponent, InfoSection } from '../../shared/tool-info-section/tool-info-section.component';

type ClipShape = 'inset' | 'circle' | 'ellipse' | 'polygon';

interface InsetParams {
  top: number;
  right: number;
  bottom: number;
  left: number;
  borderRadius: number;
}

interface CircleParams {
  radius: number;
  posX: number;
  posY: number;
}

interface EllipseParams {
  radiusX: number;
  radiusY: number;
  posX: number;
  posY: number;
}

// For simplicity, we'll use predefined polygon shapes
type PolygonShape = 'triangle' | 'trapezoid' | 'rhombus' | 'star';
const polygonPaths: Record<PolygonShape, string> = {
  triangle: '50% 0%, 0% 100%, 100% 100%',
  trapezoid: '20% 0%, 80% 0%, 100% 100%, 0% 100%',
  rhombus: '50% 0%, 100% 50%, 50% 100%, 0% 50%',
  star: '50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%',
};

@Component({
  selector: 'app-clip-path-generator',
  standalone: true,
  imports: [FormsModule, CommonModule, ToolInfoSectionComponent],
  templateUrl: './clip-path-generator.component.html',
  styleUrls: ['./clip-path-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipPathGeneratorComponent {
  // --- Main State ---
  selectedShape = signal<ClipShape>('polygon');
  copyButtonText = signal('Copiar CSS');

  // --- Shape Parameters ---
  insetParams = signal<InsetParams>({ top: 10, right: 10, bottom: 10, left: 10, borderRadius: 0 });
  circleParams = signal<CircleParams>({ radius: 50, posX: 50, posY: 50 });
  ellipseParams = signal<EllipseParams>({ radiusX: 50, radiusY: 30, posX: 50, posY: 50 });
  selectedPolygon = signal<PolygonShape>('star');

  polygonShapes = Object.keys(polygonPaths) as PolygonShape[];

  // --- Computed CSS ---
  clipPathCss = computed(() => {
    switch (this.selectedShape()) {
      case 'inset':
        const i = this.insetParams();
        return `inset(${i.top}% ${i.right}% ${i.bottom}% ${i.left}% round ${i.borderRadius}%)`;
      case 'circle':
        const c = this.circleParams();
        return `circle(${c.radius}% at ${c.posX}% ${c.posY}%)`;
      case 'ellipse':
        const e = this.ellipseParams();
        return `ellipse(${e.radiusX}% ${e.radiusY}% at ${e.posX}% ${e.posY}%)`;
      case 'polygon':
        return `polygon(${polygonPaths[this.selectedPolygon()]})`;
      default:
        return 'none';
    }
  });

  infoSections = computed<InfoSection[]>(() => [
    {
        title: 'Introdução e Valor da Ferramenta',
        content: `
            <h4>O que é o Gerador de Clip-Path?</h4>
            <p>Esta ferramenta permite criar visualmente formas complexas para mascarar elementos usando a propriedade CSS <code>clip-path</code>. Em vez de ter apenas retângulos e círculos, você pode "cortar" seus elementos em triângulos, estrelas, elipses e muito mais, mostrando apenas a parte do elemento que está dentro da forma definida.</p>
            
            <h4>Por que usar Clip-Path?</h4>
            <p><code>clip-path</code> abre um mundo de possibilidades criativas para o design web, permitindo:</p>
            <ul>
                <li>Criar layouts e galerias de imagens não convencionais e mais dinâmicas.</li>
                <li>Desenvolver efeitos de hover interessantes, animando a forma da máscara.</li>
                <li>Construir interfaces que se destacam visualmente sem a necessidade de imagens pesadas.</li>
            </ul>

            <h4>Características ⚡️</h4>
            <ul>
                <li><strong>Formas Variadas:</strong> Suporte para recortes (<code>inset</code>), círculos, elipses e uma seleção de polígonos pré-definidos.</li>
                <li><strong>Controles Intuitivos:</strong> Sliders para ajustar todos os parâmetros de cada forma em tempo real.</li>
                <li><strong>Pré-visualização Instantânea:</strong> Veja o efeito aplicado sobre uma imagem de exemplo no momento em que você ajusta um controle.</li>
                <li><strong>Código Pronto para Usar:</strong> Copie o CSS <code>clip-path</code> gerado com um único clique.</li>
            </ul>
        `
    },
    {
        title: 'Guia de Uso e Exemplos',
        content: `
            <h4>Como Usar o Gerador de Clip-Path</h4>
            <ol>
                <li><strong>Selecione a Forma Base:</strong> No menu "Forma", escolha entre Polígono, Recorte, Círculo ou Elipse.</li>
                <li><strong>Ajuste os Parâmetros:</strong> Use os controles que aparecem para a forma selecionada.</li>
                <li><strong>Copie o Código:</strong> Quando estiver satisfeito, clique no botão "Copiar CSS" na caixa de código.</li>
            </ol>
            
            <h4>Exemplos Prontos para Copiar</h4>
            <p>Inspire-se com alguns presets. Use-os como ponto de partida para suas criações.</p>
            <div class="presets-grid">
                <div class="preset-card">
                    <h5>Hexágono</h5>
                    <div class="preset-preview-wrapper">
                        <img src="https://picsum.photos/200/200?image=1025" alt="Preview de um hexágono" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">
                    </div>
                    <div class="code-wrapper">
                      <pre><code>clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);</code></pre>
                      <button class="copy-button" data-copy-code="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">Copiar</button>
                    </div>
                </div>
                <div class="preset-card">
                    <h5>Balão de Mensagem</h5>
                    <div class="preset-preview-wrapper">
                        <img src="https://picsum.photos/200/200?image=10" alt="Preview de um balão de mensagem" style="clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%);">
                    </div>
                     <div class="code-wrapper">
                      <pre><code>clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%);</code></pre>
                      <button class="copy-button" data-copy-code="clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%);">Copiar</button>
                    </div>
                </div>
                <div class="preset-card">
                    <h5>Cruz</h5>
                    <div class="preset-preview-wrapper">
                        <img src="https://picsum.photos/200/200?image=1003" alt="Preview de uma cruz" style="clip-path: polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%);">
                    </div>
                     <div class="code-wrapper">
                      <pre><code>clip-path: polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%);</code></pre>
                      <button class="copy-button" data-copy-code="clip-path: polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%);">Copiar</button>
                    </div>
                </div>
                <div class="preset-card">
                    <h5>Seta para a Direita</h5>
                    <div class="preset-preview-wrapper">
                        <img src="https://picsum.photos/200/200?image=1015" alt="Preview de uma seta" style="clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);">
                    </div>
                    <div class="code-wrapper">
                      <pre><code>clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);</code></pre>
                      <button class="copy-button" data-copy-code="clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);">Copiar</button>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: 'Melhores Práticas e Contexto Técnico',
        content: `
            <h4>Melhores Práticas para Animações</h4>
            <p>A propriedade <code>clip-path</code> é animável com a propriedade <code>transition</code>, o que é ótimo para efeitos de hover.
            <br><strong>Importante:</strong> Para uma transição suave, as formas de início e fim (ex: <code>clip-path</code> normal e em <code>:hover</code>) DEVEM ter o mesmo número de pontos/vértices. Animar de um <code>circle()</code> para um <code>polygon()</code> com 8 vértices não funcionará suavemente.</p>

            <h4>Compatibilidade entre Navegadores</h4>
            <p>A propriedade tem bom suporte nos navegadores modernos. Para garantir compatibilidade com versões mais antigas do Safari e Chrome, é uma boa prática incluir a versão com prefixo: <code>-webkit-clip-path: ...;</code>.</p>
            
            <h4>Performance</h4>
            <p>Formas básicas são muito rápidas. Polígonos com muitos pontos podem ser mais lentos para o navegador renderizar, especialmente se animados. Use com moderação em elementos que se movem ou mudam com frequência.</p>
        `
    },
    {
        title: 'Perguntas Frequentes (FAQ)',
        content: `
            <h4>Posso usar um SVG personalizado para o clip-path?</h4>
            <p>Sim! A propriedade <code>clip-path</code> aceita uma referência a um SVG com a função <code>url()</code>. Por exemplo: <code>clip-path: url(#meu-caminho-svg);</code>. Esta ferramenta foca nas formas básicas do CSS para simplicidade, mas o uso de SVGs oferece controle total para formas mais complexas.</p>

            <h4>O que acontece com o conteúdo "cortado"?</h4>
            <p>O conteúdo fora da forma definida pelo <code>clip-path</code> não é renderizado e não captura eventos de mouse (como cliques ou hovers). Ele é efetivamente invisível e não interativo.</p>
            
            <h4>Qual a diferença entre <code>clip-path</code> e <code>mask-image</code>?</h4>
            <p><code>clip-path</code> cria um caminho vetorial com bordas rígidas. <code>mask-image</code> usa uma imagem (incluindo gradientes PNG) para mascarar um elemento, permitindo bordas suaves e níveis de transparência variados.</p>

            <h4>Como faço para um polígono personalizado?</h4>
            <p>Esta ferramenta usa presets de polígonos. Para formas totalmente personalizadas, você precisaria de um editor visual de SVG/polígonos, como o <a href="https://bennettfeely.com/clippy/" target="_blank" rel="noopener noreferrer">Clippy</a>, e então copiar as coordenadas do polígono gerado por ele.</p>
        `
    }
  ]);

  // --- Methods ---
  updateInset<K extends keyof InsetParams>(param: K, value: number): void {
    this.insetParams.update(p => ({ ...p, [param]: value }));
  }

  updateCircle<K extends keyof CircleParams>(param: K, value: number): void {
    this.circleParams.update(p => ({ ...p, [param]: value }));
  }

  updateEllipse<K extends keyof EllipseParams>(param: K, value: number): void {
    this.ellipseParams.update(p => ({ ...p, [param]: value }));
  }

  copyCss(): void {
    navigator.clipboard.writeText(`clip-path: ${this.clipPathCss()};`).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar CSS'), 2000);
    });
  }

  getPolygonName(shape: PolygonShape): string {
    const name = shape.charAt(0).toUpperCase() + shape.slice(1);
    const nameMap: Record<string, string> = {
      'Triangle': 'Triângulo',
      'Trapezoid': 'Trapézio',
      'Rhombus': 'Losango',
      'Star': 'Estrela'
    }
    return nameMap[name] || name;
  }
}
