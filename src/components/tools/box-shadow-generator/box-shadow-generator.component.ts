import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolInfoSectionComponent, InfoSection } from '../../shared/tool-info-section/tool-info-section.component';

// Interface for a single shadow layer
interface ShadowLayer {
  id: number;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius: number;
  color: string;
  opacity: number;
  inset: boolean;
}

@Component({
  selector: 'app-box-shadow-generator',
  standalone: true,
  imports: [FormsModule, CommonModule, ToolInfoSectionComponent],
  templateUrl: './box-shadow-generator.component.html',
  styleUrls: ['./box-shadow-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoxShadowGeneratorComponent {
  layers = signal<ShadowLayer[]>([
    {
      id: 1,
      offsetX: 10,
      offsetY: 10,
      blurRadius: 20,
      spreadRadius: 5,
      color: '#000000',
      opacity: 0.5,
      inset: false,
    },
  ]);
  activeLayerId = signal<number>(1);
  nextLayerId = 2;
  copyButtonText = signal('Copiar CSS');

  // Preview box settings
  previewElementColor = signal('#58a6ff');
  previewBackgroundColor = signal('#161b22');

  activeLayer = computed(() => {
    const activeId = this.activeLayerId();
    return this.layers().find(layer => layer.id === activeId);
  });

  // Computed property to generate the final CSS string
  boxShadowCss = computed(() => {
    return this.layers()
      .map(layer => {
        const color = this.hexToRgba(layer.color, layer.opacity);
        const inset = layer.inset ? 'inset ' : '';
        return `${inset}${layer.offsetX}px ${layer.offsetY}px ${layer.blurRadius}px ${layer.spreadRadius}px ${color}`;
      })
      .join(',\n');
  });

  infoSections = computed<InfoSection[]>(() => [
    {
      title: 'Introdução e Valor da Ferramenta',
      content: `
        <h4>O que é este Gerador de Sombra da Caixa (Box Shadow)?</h4>
        <p>Esta é uma ferramenta visual para criar e ajustar sombras CSS (<code>box-shadow</code>). Ela permite que você manipule parâmetros como deslocamento, desfoque, espalhamento e cor, gerando o código correspondente em tempo real. É ideal para designers e desenvolvedores que desejam criar sombras complexas e em camadas sem escrever o código manualmente.</p>
        
        <h4>Por que personalizar sombras com utilidades?</h4>
        <p>Embora frameworks como o Tailwind CSS ofereçam excelentes classes de utilidade para sombras, há momentos em que você precisa de algo único. Sombras personalizadas podem ajudar a:</p>
        <ul>
            <li>Criar uma profundidade e hierarquia visual mais sofisticada.</li>
            <li>Alinhar o design com uma identidade de marca específica.</li>
            <li>Desenvolver efeitos de UI únicos, como brilhos, sombras internas ou múltiplas camadas de sombra.</li>
        </ul>

        <h4>Características ⚡️</h4>
        <ul>
            <li><strong>Múltiplas Camadas:</strong> Adicione e gerencie várias sombras em um único elemento.</li>
            <li><strong>Controle Total:</strong> Ajuste o deslocamento X/Y, raio de desfoque, raio de espalhamento, cor e opacidade.</li>
            <li><strong>Sombras Internas (Inset):</strong> Crie efeitos de profundidade "para dentro" com um único clique.</li>
            <li><strong>Visualização em Tempo Real:</strong> Veja suas alterações aplicadas instantaneamente em um elemento de pré-visualização.</li>
            <li><strong>Geração de Código:</strong> Copie o código CSS <code>box-shadow</code> pronto para usar.</li>
        </ul>
      `
    },
    {
      title: 'Guia de Uso e Exemplos Práticos',
      content: `
        <h4>Como Usar o Gerador de Sombras</h4>
        <ol>
          <li><strong>Gerenciar Camadas:</strong> Use os botões "Adicionar Camada" para criar novas sombras. Cada camada pode ser configurada independentemente. Clique em uma camada na lista para selecioná-la e editá-la.</li>
          <li><strong>Ajustar Parâmetros:</strong> Utilize os sliders para modificar os valores da camada ativa.</li>
          <li><strong>Copiar o Código:</strong> Clique no botão "Copiar CSS" para obter a propriedade <code>box-shadow</code> completa e colá-la em seu arquivo CSS.</li>
        </ol>

        <h4>Sombras Prontas para Copiar</h4>
        <p>Precisa de um ponto de partida? Escolha um dos nossos presets de alta qualidade. Use o botão para copiar o código.</p>
        <div class="presets-grid">
            <div class="preset-card">
                <h5>Sombra Suave (Soft UI)</h5>
                <div class="preset-preview-wrapper">
                    <div class="preset-preview" style="background-color: #161b22; box-shadow: 6px 6px 12px #0c1015, -6px -6px 12px #202833;"></div>
                </div>
                <div class="code-wrapper">
                    <pre><code>box-shadow: 6px 6px 12px #0c1015, -6px -6px 12px #202833;</code></pre>
                    <button class="copy-button" data-copy-code="box-shadow: 6px 6px 12px #0c1015, -6px -6px 12px #202833;">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Sombra Profunda</h5>
                <div class="preset-preview-wrapper">
                    <div class="preset-preview" style="box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);"></div>
                </div>
                <div class="code-wrapper">
                    <pre><code>box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);</code></pre>
                    <button class="copy-button" data-copy-code="box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Brilho Neon</h5>
                <div class="preset-preview-wrapper">
                    <div class="preset-preview" style="background-color: #0d1117; box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #58a6ff, 0 0 20px #58a6ff;"></div>
                </div>
                <div class="code-wrapper">
                    <pre><code>box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #58a6ff, 0 0 20px #58a6ff;</code></pre>
                    <button class="copy-button" data-copy-code="box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #58a6ff, 0 0 20px #58a6ff;">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Pressionado (Inset)</h5>
                <div class="preset-preview-wrapper">
                    <div class="preset-preview" style="box-shadow: inset 5px 5px 10px #0c1015, inset -5px -5px 10px #202833;"></div>
                </div>
                <div class="code-wrapper">
                    <pre><code>box-shadow: inset 5px 5px 10px #0c1015, inset -5px -5px 10px #202833;</code></pre>
                    <button class="copy-button" data-copy-code="box-shadow: inset 5px 5px 10px #0c1015, inset -5px -5px 10px #202833;">Copiar</button>
                </div>
            </div>
        </div>
      `
    },
    {
      title: 'Melhores Práticas e Contexto Técnico',
      content: `
        <h4>Melhores Práticas para Uso de Sombras de Caixa</h4>
        <ul>
          <li><strong>Sutileza é a chave:</strong> Sombras muito escuras e duras podem parecer datadas. Opte por sombras mais suaves e com baixa opacidade para um look moderno.</li>
          <li><strong>Use Múltiplas Camadas:</strong> Combinar duas ou mais camadas de sombra (uma mais difusa e outra mais sutil e próxima) pode criar um efeito de profundidade muito mais realista.</li>
          <li><strong>Considere a Fonte de Luz:</strong> Para uma UI coesa, imagine uma fonte de luz (geralmente vindo de cima, à esquerda) e aplique suas sombras de forma consistente.</li>
        </ul>
        
        <h4>Desempenho e Manutenibilidade</h4>
        <p>O uso excessivo de <code>box-shadow</code>, especialmente com grandes valores de <code>blur</code> e <code>spread</code>, pode impactar o desempenho da renderização do navegador, pois exige cálculos complexos. Para animações, prefira animar <code>opacity</code> ou <code>transform</code> em vez de <code>box-shadow</code>.</p>
      `
    },
    {
      title: 'Suporte e Perguntas Frequentes (FAQ)',
      content: `
        <h4>O Gerador de Sombras de Caixa é gratuito para usar?</h4>
        <p>Sim, esta ferramenta é totalmente gratuita e de código aberto.</p>

        <h4>Quais parâmetros um CSS box-shadow usa?</h4>
        <p>A sintaxe é <code>box-shadow: [inset] [offsetX] [offsetY] [blurRadius] [spreadRadius] [color];</code>. <strong>Inset</strong> torna a sombra interna. <strong>OffsetX/Y</strong> move a sombra. <strong>Blur</strong> desfoca. <strong>Spread</strong> aumenta o tamanho da sombra.</p>

        <h4>Quando devo usar uma sombra embutida (inset)?</h4>
        <p>Sombras <code>inset</code> são ótimas para criar a ilusão de que um elemento está "pressionado" ou afundado na página, como em botões ativos ou campos de formulário focados.</p>

        <h4>Sombras pesadas prejudicam o desempenho?</h4>
        <p>Sim, especialmente em elementos grandes ou durante animações. O navegador precisa recalcular a área de sombra a cada frame. Use com moderação em animações e evite valores de blur muito altos em elementos grandes e complexos.</p>
        
        <h4>Posso tornar as sombras responsivas ou baseadas em estados no Tailwind?</h4>
        <p>Sim! Você pode aplicar classes de sombra condicionalmente usando prefixos de estado (como <code>hover:shadow-lg</code>) ou de breakpoint (<code>md:shadow-xl</code>).</p>
      `
    }
  ]);

  selectLayer(id: number): void {
    this.activeLayerId.set(id);
  }

  addLayer(): void {
    const newLayer: ShadowLayer = {
      id: this.nextLayerId++,
      offsetX: 0,
      offsetY: 5,
      blurRadius: 10,
      spreadRadius: 0,
      color: '#000000',
      opacity: 0.4,
      inset: false,
    };
    this.layers.update(layers => [...layers, newLayer]);
    this.activeLayerId.set(newLayer.id);
  }

  removeLayer(idToRemove: number): void {
    const wasActive = this.activeLayerId() === idToRemove;
    this.layers.update(layers => layers.filter(layer => layer.id !== idToRemove));
    
    // If the removed layer was active, select another one
    if (wasActive && this.layers().length > 0) {
      this.activeLayerId.set(this.layers()[0].id);
    } else if (this.layers().length === 0) {
      this.activeLayerId.set(0); // No active layer
    }
  }

  updateLayer<K extends keyof ShadowLayer>(property: K, value: ShadowLayer[K]): void {
    const activeId = this.activeLayerId();
    this.layers.update(layers =>
      layers.map(layer =>
        layer.id === activeId ? { ...layer, [property]: value } : layer
      )
    );
  }
  
  // Helper to convert HEX and opacity to RGBA
  private hexToRgba(hex: string, opacity: number): string {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity})`;
    }
    // Fallback for invalid hex
    return `rgba(0,0,0,${opacity})`;
  }

  copyCss(): void {
    navigator.clipboard.writeText(`box-shadow: ${this.boxShadowCss()};`).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar CSS'), 2000);
    });
  }
}
