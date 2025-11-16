import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolInfoSectionComponent, InfoSection } from '../../shared/tool-info-section/tool-info-section.component';

interface Filter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

@Component({
  selector: 'app-css-filter-generator',
  standalone: true,
  imports: [FormsModule, CommonModule, ToolInfoSectionComponent],
  templateUrl: './css-filter-generator.component.html',
  styleUrls: ['./css-filter-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssFilterGeneratorComponent {
  
  private readonly initialFilters: Filter[] = [
    { name: 'blur', value: 0, min: 0, max: 20, step: 0.1, unit: 'px' },
    { name: 'brightness', value: 100, min: 0, max: 200, step: 1, unit: '%' },
    { name: 'contrast', value: 100, min: 0, max: 200, step: 1, unit: '%' },
    { name: 'grayscale', value: 0, min: 0, max: 100, step: 1, unit: '%' },
    { name: 'hue-rotate', value: 0, min: 0, max: 360, step: 1, unit: 'deg' },
    { name: 'invert', value: 0, min: 0, max: 100, step: 1, unit: '%' },
    { name: 'opacity', value: 100, min: 0, max: 100, step: 1, unit: '%' },
    { name: 'saturate', value: 100, min: 0, max: 200, step: 1, unit: '%' },
    { name: 'sepia', value: 0, min: 0, max: 100, step: 1, unit: '%' }
  ];

  filters = signal<Filter[]>(JSON.parse(JSON.stringify(this.initialFilters)));

  copyButtonText = signal('Copiar CSS');

  infoSections: InfoSection[] = [
    {
      title: 'Introdução e Valor da Ferramenta',
      content: `
        <h4>O que é o Gerador de Filtros CSS?</h4>
        <p>Esta é uma ferramenta interativa para aplicar e combinar efeitos visuais em elementos da web usando a propriedade CSS <code>filter</code>. Você pode ajustar sliders para controlar brilho, contraste, desfoque, saturação e mais, vendo o resultado em tempo real em uma imagem de exemplo.</p>
        
        <h4>Por que usar filtros CSS?</h4>
        <p>Filtros CSS permitem que você altere a renderização de um elemento de forma não destrutiva, diretamente no navegador. Eles são úteis para:</p>
        <ul>
            <li>Ajustar a aparência de imagens sem precisar de um editor de fotos.</li>
            <li>Criar efeitos de hover dinâmicos (por exemplo, dessaturar uma imagem e colori-la no hover).</li>
            <li>Implementar o popular efeito "frosted glass" (vidro fosco) usando <code>backdrop-filter</code>.</li>
            <li>Melhorar a acessibilidade, como aumentar o contraste ou converter para escala de cinza.</li>
        </ul>

        <h4>Características ⚡️</h4>
        <ul>
            <li><strong>Múltiplos Filtros:</strong> Ajuste e combine 9 filtros CSS diferentes, incluindo <code>sepia</code>.</li>
            <li><strong>Controles com Sliders:</strong> Interface intuitiva para modificar os valores de cada filtro.</li>
            <li><strong>Pré-visualização ao Vivo:</strong> Veja o resultado de suas alterações instantaneamente.</li>
            <li><strong>Reset Rápido:</strong> Volte aos valores padrão com um único clique.</li>
            <li><strong>Geração de Código:</strong> Copie a propriedade <code>filter</code> completa e pronta para uso.</li>
        </ul>
      `
    },
    {
      title: 'Guia de Uso e Exemplos',
      content: `
        <h4>Como Usar o Gerador de Filtros</h4>
        <ol>
          <li><strong>Ajuste os Sliders:</strong> Mova os controles deslizantes para cada propriedade de filtro. Os valores padrão (como 100% para brilho) representam o estado normal do elemento.</li>
          <li><strong>Observe a Imagem:</strong> A imagem de exemplo na área de pré-visualização refletirá suas alterações em tempo real.</li>
          <li><strong>Combine Efeitos:</strong> Experimente usar múltiplos filtros ao mesmo tempo para criar estilos únicos. A ordem dos filtros não importa.</li>
          <li><strong>Resetar:</strong> Se quiser começar de novo, clique em "Resetar Filtros".</li>
          <li><strong>Copiar o CSS:</strong> Clique no botão "Copiar CSS" para obter a linha de código completa.</li>
        </ol>

        <h4>Exemplos Prontos para Copiar</h4>
        <p>Combine filtros para criar efeitos interessantes. Use os presets abaixo como inspiração.</p>
        <div class="presets-grid">
            <div class="preset-card">
                <h5>Sépia Vintage</h5>
                <div class="preset-preview-wrapper">
                    <img src="https://picsum.photos/200/200?image=1040" alt="Preview Sépia" style="filter: sepia(60%) contrast(110%) brightness(90%) saturate(130%);">
                </div>
                <div class="code-wrapper">
                    <pre><code>filter: sepia(60%) contrast(110%) brightness(90%) saturate(130%);</code></pre>
                    <button class="copy-button" data-copy-code="filter: sepia(60%) contrast(110%) brightness(90%) saturate(130%);">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Preto e Branco (Alto Contraste)</h5>
                <div class="preset-preview-wrapper">
                    <img src="https://picsum.photos/200/200?image=1041" alt="Preview P&B" style="filter: grayscale(100%) contrast(150%);">
                </div>
                 <div class="code-wrapper">
                    <pre><code>filter: grayscale(100%) contrast(150%);</code></pre>
                    <button class="copy-button" data-copy-code="filter: grayscale(100%) contrast(150%);">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Cores Vibrantes</h5>
                <div class="preset-preview-wrapper">
                    <img src="https://picsum.photos/200/200?image=1043" alt="Preview Vibrante" style="filter: saturate(200%) brightness(110%);">
                </div>
                 <div class="code-wrapper">
                    <pre><code>filter: saturate(200%) brightness(110%);</code></pre>
                    <button class="copy-button" data-copy-code="filter: saturate(200%) brightness(110%);">Copiar</button>
                </div>
            </div>
            <div class="preset-card">
                <h5>Efeito Invertido</h5>
                <div class="preset-preview-wrapper">
                    <img src="https://picsum.photos/200/200?image=1044" alt="Preview Invertido" style="filter: invert(100%);">
                </div>
                 <div class="code-wrapper">
                    <pre><code>filter: invert(100%);</code></pre>
                    <button class="copy-button" data-copy-code="filter: invert(100%);">Copiar</button>
                </div>
            </div>
        </div>
      `
    },
    {
      title: 'Melhores Práticas e Contexto Técnico',
      content: `
        <h4>Performance dos Filtros</h4>
        <p>A maioria dos navegadores modernos é muito eficiente na aplicação de filtros, e muitos (como <code>blur</code>, <code>drop-shadow</code>) podem ser acelerados por hardware (GPU). No entanto, aplicar filtros complexos a elementos grandes ou que estão sendo animados pode, em alguns casos, impactar o desempenho. Use as ferramentas de desenvolvedor do seu navegador para inspecionar o desempenho de renderização se notar lentidão.</p>
        
        <h4><code>filter</code> vs. <code>backdrop-filter</code></h4>
        <p>A propriedade <code>filter</code>, usada nesta ferramenta, aplica os efeitos ao próprio elemento. Existe uma propriedade relacionada, <code>backdrop-filter</code>, que aplica os efeitos a tudo que está <em>atrás</em> do elemento. Ela é a chave para criar o efeito "frosted glass", onde um painel semi-transparente desfoca o conteúdo abaixo dele.</p>
        <pre><code>.painel-fosco {
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}</code></pre>
      `
    },
    {
      title: 'Perguntas Frequentes (FAQ)',
      content: `
        <h4>Qual a diferença entre o filtro <code>opacity()</code> e a propriedade <code>opacity</code>?</h4>
        <p>Ambos tornam um elemento transparente. A principal diferença é que a propriedade <code>opacity</code> pode, em alguns navegadores, ser melhor otimizada para animações. Na maioria dos casos, o resultado visual é idêntico.</p>

        <h4>Os filtros CSS são animáveis?</h4>
        <p>Sim! Você pode usar a propriedade <code>transition</code> para criar uma transição suave entre diferentes estados de filtro, como no exemplo de hover acima. Isso abre muitas possibilidades para interações criativas.</p>

        <h4>Os filtros afetam a legibilidade do texto?</h4>
        <p>Sim. Filtros como <code>blur</code>, <code>contrast</code> e <code>invert</code> podem impactar drasticamente a legibilidade do texto dentro do elemento. Use-os com cuidado em elementos que contenham texto e sempre verifique o contraste.</p>
      `
    }
  ];

  filterCss = computed(() => {
    return this.filters()
      .map(filter => {
        let value = filter.value;
        // Adjust value for non-percentage units that are not degrees or pixels
        if (filter.unit !== '%' && filter.unit !== 'deg' && filter.unit !== 'px') {
            value = filter.value / 100;
        }
        return `${filter.name}(${value}${filter.unit})`;
      })
      .join(' ');
  });

  updateFilter(index: number, value: number): void {
    this.filters.update(filters => {
      const newFilters = [...filters];
      newFilters[index] = { ...newFilters[index], value };
      return newFilters;
    });
  }
  
  resetFilters(): void {
    this.filters.set(JSON.parse(JSON.stringify(this.initialFilters)));
  }

  copyCss(): void {
    navigator.clipboard.writeText(`filter: ${this.filterCss()};`).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar CSS'), 2000);
    });
  }

  getFilterDisplayName(name: string): string {
    const nameMap: Record<string, string> = {
      'blur': 'Blur (Desfoque)',
      'brightness': 'Brilho',
      'contrast': 'Contraste',
      'grayscale': 'Escala de Cinza',
      'hue-rotate': 'Girar Matiz',
      'invert': 'Inverter',
      'opacity': 'Opacidade',
      'saturate': 'Saturação',
      'sepia': 'Sépia',
    };
    return nameMap[name] || name;
  }
}
