import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolInfoSectionComponent, InfoSection } from '../../shared/tool-info-section/tool-info-section.component';

interface ColorStop {
  id: number;
  color: string;
  position: number; // 0-100
}

type GradientType = 'linear' | 'radial';
type RadialShape = 'ellipse' | 'circle';

@Component({
  selector: 'app-css-gradient-generator',
  standalone: true,
  imports: [FormsModule, CommonModule, ToolInfoSectionComponent],
  templateUrl: './css-gradient-generator.component.html',
  styleUrls: ['./css-gradient-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssGradientGeneratorComponent {
  // --- Main State ---
  gradientType = signal<GradientType>('linear');
  colorStops = signal<ColorStop[]>([
    { id: 1, color: '#58a6ff', position: 0 },
    { id: 2, color: '#3fb950', position: 100 },
  ]);
  activeStopId = signal<number>(1);
  private nextStopId = 3;

  // --- Linear Gradient State ---
  linearAngle = signal(90);

  // --- Radial Gradient State ---
  radialShape = signal<RadialShape>('ellipse');
  radialPositionX = signal(50);
  radialPositionY = signal(50);

  // --- UI State ---
  copyButtonText = signal('Copiar CSS');

  infoSections = computed<InfoSection[]>(() => [
    {
      title: 'Introdução e Valor da Ferramenta',
      content: `
        <h4>O que é o Gerador de Gradiente CSS?</h4>
        <p>Esta é uma ferramenta visual que simplifica a criação de gradientes CSS. Você pode adicionar, remover e modificar "paradas de cor" (color stops), alternar entre gradientes lineares e radiais, e ajustar seus parâmetros para criar transições de cores suaves e complexas. O código CSS é gerado automaticamente.</p>
        
        <h4>Por que usar gradientes?</h4>
        <p>Gradientes são uma alternativa poderosa a cores sólidas e imagens de fundo. Eles podem ser usados para:</p>
        <ul>
          <li>Adicionar profundidade e apelo visual a botões, cards e seções.</li>
          <li>Criar fundos de página dinâmicos e modernos.</li>
          <li>Implementar sobreposições de cores em imagens para melhorar a legibilidade do texto.</li>
          <li>Construir elementos de UI, como gráficos e barras de progresso.</li>
        </ul>

        <h4>Características ⚡️</h4>
        <ul>
          <li><strong>Tipos de Gradiente:</strong> Suporte para gradientes lineares e radiais.</li>
          <li><strong>Editor Visual de Cores:</strong> Adicione, mova e delete paradas de cor diretamente em uma barra de visualização.</li>
          <li><strong>Controles Detalhados:</strong> Ajuste o ângulo do gradiente linear ou a posição e forma do gradiente radial.</li>
          <li><strong>Cores Ilimitadas:</strong> Use quantas paradas de cor forem necessárias para seu design.</li>
          <li><strong>Geração de Código Instantânea:</strong> Copie o CSS pronto para usar com um clique.</li>
        </ul>
      `
    },
    {
      title: 'Guia de Uso e Exemplos',
      content: `
        <h4>Como Usar o Gerador de Gradiente</h4>
        <ol>
          <li><strong>Escolha o Tipo:</strong> Selecione entre 'Linear' ou 'Radial'.</li>
          <li><strong>Ajuste os Parâmetros:</strong>
              <ul>
                <li><strong>Linear:</strong> Use o slider de 'Ângulo' para definir a direção do gradiente. 0deg é de baixo para cima, 90deg é da esquerda para a direita.</li>
                <li><strong>Radial:</strong> Escolha a forma ('Elipse' ou 'Círculo') e ajuste a posição do centro do gradiente.</li>
              </ul>
          </li>
          <li><strong>Manipule as Cores:</strong>
            <ul>
                <li><strong>Adicionar:</strong> Clique em qualquer lugar na barra de visualização de gradiente para adicionar uma nova parada de cor.</li>
                <li><strong>Selecionar:</strong> Clique em um dos círculos na barra para selecionar uma parada de cor e editar suas propriedades abaixo.</li>
                <li><strong>Remover:</strong> Selecione uma parada de cor e clique no botão de lixeira.</li>
                <li><strong>Editar:</strong> Com uma parada selecionada, use o seletor de cores e o slider de 'Posição' para ajustá-la.</li>
            </ul>
          </li>
          <li><strong>Copiar o Código:</strong> Clique em "Copiar CSS" para obter a propriedade <code>background-image</code>.</li>
        </ol>

        <h4>Gradientes Prontos para Usar</h4>
        <p>Precisa de inspiração? Use estes presets como ponto de partida.</p>
        <div class="presets-grid">
            <div class="preset-card">
                <h5>Azul Oceano</h5>
                <div class="preset-preview-wrapper">
                    <div class="gradient-preset-preview" style="background-image: linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%);"></div>
                </div>
                <div class="code-wrapper">
                    <pre><code>background-image: linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%);</code></pre>
                    <button class="copy-button" data-copy-code="background-image: linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%);">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Pôr do Sol Quente</h5>
                <div class="preset-preview-wrapper">
                    <div class="gradient-preset-preview" style="background-image: linear-gradient(to right, #ff7e5f, #feb47b);"></div>
                </div>
                <div class="code-wrapper">
                    <pre><code>background-image: linear-gradient(to right, #ff7e5f, #feb47b);</code></pre>
                    <button class="copy-button" data-copy-code="background-image: linear-gradient(to right, #ff7e5f, #feb47b);">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Festa Neon</h5>
                <div class="preset-preview-wrapper">
                    <div class="gradient-preset-preview" style="background-image: linear-gradient(to right, #f857a6, #ff5858);"></div>
                </div>
                <div class="code-wrapper">
                    <pre><code>background-image: linear-gradient(to right, #f857a6, #ff5858);</code></pre>
                    <button class="copy-button" data-copy-code="background-image: linear-gradient(to right, #f857a6, #ff5858);">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Floresta Verdejante</h5>
                <div class="preset-preview-wrapper">
                    <div class="gradient-preset-preview" style="background-image: linear-gradient(135deg, #5A3F37 0%, #2C7744 100%);"></div>
                </div>
                <div class="code-wrapper">
                    <pre><code>background-image: linear-gradient(135deg, #5A3F37 0%, #2C7744 100%);</code></pre>
                    <button class="copy-button" data-copy-code="background-image: linear-gradient(135deg, #5A3F37 0%, #2C7744 100%);">Copiar</button>
                </div>
            </div>
        </div>
      `
    },
    {
      title: 'Melhores Práticas e Contexto Técnico',
      content: `
        <h4>Melhores Práticas para Gradientes</h4>
        <ul>
          <li><strong>Transições Sutis:</strong> Para um look profissional, use cores que não contrastem de forma agressiva. Gradientes entre tons da mesma cor ou cores análogas funcionam bem.</li>
          <li><strong>Acessibilidade:</strong> Se houver texto sobre o gradiente, certifique-se de que o contraste seja suficiente em todas as partes do gradiente para garantir a legibilidade.</li>
          <li><strong>Use como Sobreposição:</strong> Um gradiente de preto para transparente sobre uma imagem pode escurecer uma parte dela, tornando o texto branco mais legível.</li>
        </ul>
        
        <h4>Desempenho e Compatibilidade</h4>
        <p>Gradientes CSS são altamente performáticos, pois são renderizados nativamente pelo navegador e não requerem o download de uma imagem. A compatibilidade é excelente nos navegadores modernos. Para compatibilidade máxima com navegadores mais antigos, pode ser necessário usar prefixos (<code>-webkit-</code>, <code>-moz-</code>), mas para a maioria dos projetos atuais, isso não é mais uma preocupação.</p>
      `
    },
    {
      title: 'Perguntas Frequentes (FAQ)',
      content: `
        <h4>O que é uma "parada de cor" (color stop)?</h4>
        <p>É um ponto ao longo do gradiente onde uma cor específica é definida. O navegador então calcula a transição suave entre essas paradas. Cada parada tem uma cor e uma posição (de 0% a 100%).</p>

        <h4>Posso usar cores com transparência (RGBA)?</h4>
        <p>Sim! Os seletores de cor nativos do navegador geralmente permitem que você defina um valor alfa (transparência). A sintaxe CSS suporta totalmente cores <code>rgba()</code>, o que é ótimo para criar efeitos de sobreposição.</p>

        <h4>O que são gradientes repetidos (repeating gradients)?</h4>
        <p>São gradientes que se repetem para preencher o fundo. Esta ferramenta não os gera diretamente, mas você pode criar o efeito adicionando <code>repeating-</code> antes da função no seu CSS, por exemplo: <code>repeating-linear-gradient(...)</code>. Isso é útil para criar padrões como listras.</p>
      `
    }
  ]);

  // --- Computed Properties ---
  activeStop = computed(() => {
    const activeId = this.activeStopId();
    return this.colorStops().find(stop => stop.id === activeId);
  });

  gradientPreviewCss = computed(() => {
    const stops = this.colorStops()
      .slice() // Create a copy to avoid mutating the original signal's array
      .sort((a, b) => a.position - b.position)
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');
    return `linear-gradient(to right, ${stops})`;
  });

  generatedCss = computed(() => {
    const stops = this.colorStops()
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');

    if (this.gradientType() === 'linear') {
      return `linear-gradient(${this.linearAngle()}deg, ${stops})`;
    } else {
      return `radial-gradient(${this.radialShape()} at ${this.radialPositionX()}% ${this.radialPositionY()}%, ${stops})`;
    }
  });

  // --- Methods ---
  
  selectStop(id: number): void {
    this.activeStopId.set(id);
  }

  addStop(event: MouseEvent): void {
    const bar = (event.target as HTMLElement).getBoundingClientRect();
    const position = Math.round(((event.clientX - bar.left) / bar.width) * 100);
    
    // Find colors of neighbors
    const sortedStops = this.colorStops().slice().sort((a,b) => a.position - b.position);
    let leftColor = sortedStops[0]?.color || '#000000';
    let rightColor = sortedStops[sortedStops.length - 1]?.color || '#ffffff';

    for(let i=0; i < sortedStops.length - 1; i++){
        if(position >= sortedStops[i].position && position <= sortedStops[i+1].position){
            leftColor = sortedStops[i].color;
            rightColor = sortedStops[i+1].color;
            break;
        }
    }

    const newColor = this.interpolateColor(leftColor, rightColor, 0.5);

    const newStop: ColorStop = {
      id: this.nextStopId++,
      color: newColor,
      position,
    };
    this.colorStops.update(stops => [...stops, newStop]);
    this.activeStopId.set(newStop.id);
  }

  removeStop(idToRemove: number): void {
    if (this.colorStops().length <= 2) return;
    
    const wasActive = this.activeStopId() === idToRemove;
    this.colorStops.update(stops => stops.filter(stop => stop.id !== idToRemove));
    
    if (wasActive) {
      this.activeStopId.set(this.colorStops()[0].id);
    }
  }

  updateActiveStop(property: 'color' | 'position', value: string | number): void {
    const activeId = this.activeStopId();
    this.colorStops.update(stops =>
      stops.map(stop =>
        stop.id === activeId ? { ...stop, [property]: value } : stop
      )
    );
  }
  
  setLinearAngle(angle: number) {
    this.linearAngle.set(angle);
  }

  copyCss(): void {
    navigator.clipboard.writeText(`background-image: ${this.generatedCss()};`).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar CSS'), 2000);
    });
  }

  // Color interpolation for new stops
  private interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    if (!c1 || !c2) return '#808080';
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `#${hex}`;
  }

  private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
