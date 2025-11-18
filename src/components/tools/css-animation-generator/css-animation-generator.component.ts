
import { Component, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolInfoSectionComponent, InfoSection } from '../../shared/tool-info-section/tool-info-section.component';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';

interface AnimationPreset {
  name: string;
  label: string;
  keyframes: string;
  defaultDuration: number;
  defaultTiming: string;
}

@Component({
  selector: 'app-css-animation-generator',
  standalone: true,
  imports: [FormsModule, CommonModule, ToolInfoSectionComponent, SafeHtmlPipe],
  templateUrl: './css-animation-generator.component.html',
  styleUrls: ['./css-animation-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssAnimationGeneratorComponent {
  // --- Animation Config State ---
  animationName = signal('minhaAnimacao');
  duration = signal(1.0);
  timingFunction = signal('ease');
  delay = signal(0);
  iterationCount = signal('infinite');
  direction = signal('normal');
  fillMode = signal('forwards');

  // --- Keyframes State ---
  // We store the body of the keyframes here
  keyframesBody = signal<string>(`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
  `.trim());

  // --- UI State ---
  isPlaying = signal(true);
  copyButtonText = signal('Copiar CSS');
  
  // --- Presets Definition ---
  presets: AnimationPreset[] = [
    {
      name: 'fadeIn',
      label: 'Fade In',
      defaultDuration: 1,
      defaultTiming: 'ease-in',
      keyframes: `
  from { opacity: 0; }
  to { opacity: 1; }`
    },
    {
      name: 'fadeInUp',
      label: 'Fade In Up',
      defaultDuration: 0.8,
      defaultTiming: 'ease-out',
      keyframes: `
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }`
    },
    {
      name: 'slideInLeft',
      label: 'Slide In Left',
      defaultDuration: 0.5,
      defaultTiming: 'ease-out',
      keyframes: `
  from {
    transform: translate3d(-100%, 0, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, 0, 0);
  }`
    },
    {
      name: 'slideInRight',
      label: 'Slide In Right',
      defaultDuration: 0.5,
      defaultTiming: 'ease-out',
      keyframes: `
  from {
    transform: translate3d(100%, 0, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, 0, 0);
  }`
    },
    {
      name: 'zoomIn',
      label: 'Zoom In',
      defaultDuration: 0.5,
      defaultTiming: 'ease',
      keyframes: `
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  50% {
    opacity: 1;
  }`
    },
    {
      name: 'bounce',
      label: 'Bounce',
      defaultDuration: 1,
      defaultTiming: 'ease',
      keyframes: `
  from, 20%, 53%, 80%, to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }`
    },
    {
      name: 'pulse',
      label: 'Pulse',
      defaultDuration: 1,
      defaultTiming: 'ease-in-out',
      keyframes: `
  from {
    transform: scale3d(1, 1, 1);
  }
  50% {
    transform: scale3d(1.05, 1.05, 1.05);
  }
  to {
    transform: scale3d(1, 1, 1);
  }`
    },
    {
      name: 'rubberBand',
      label: 'Rubber Band',
      defaultDuration: 1,
      defaultTiming: 'ease',
      keyframes: `
  from { transform: scale3d(1, 1, 1); }
  30% { transform: scale3d(1.25, 0.75, 1); }
  40% { transform: scale3d(0.75, 1.25, 1); }
  50% { transform: scale3d(1.15, 0.85, 1); }
  65% { transform: scale3d(0.95, 1.05, 1); }
  75% { transform: scale3d(1.05, 0.95, 1); }
  to { transform: scale3d(1, 1, 1); }`
    },
    {
      name: 'shake',
      label: 'Shake',
      defaultDuration: 1,
      defaultTiming: 'ease',
      keyframes: `
  from, to { transform: translate3d(0, 0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate3d(-10px, 0, 0); }
  20%, 40%, 60%, 80% { transform: translate3d(10px, 0, 0); }`
    },
    {
      name: 'wobble',
      label: 'Wobble',
      defaultDuration: 1,
      defaultTiming: 'ease',
      keyframes: `
  from { transform: translate3d(0, 0, 0); }
  15% { transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg); }
  30% { transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg); }
  45% { transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg); }
  60% { transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg); }
  75% { transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg); }
  to { transform: translate3d(0, 0, 0); }`
    },
    {
      name: 'jello',
      label: 'Jello',
      defaultDuration: 0.9,
      defaultTiming: 'ease',
      keyframes: `
  from, 11.1%, to { transform: translate3d(0, 0, 0); }
  22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); }
  33.3% { transform: skewX(6.25deg) skewY(6.25deg); }
  44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); }
  55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); }
  66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); }
  77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); }
  88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); }`
    },
    {
      name: 'rotate',
      label: 'Rotate',
      defaultDuration: 2,
      defaultTiming: 'linear',
      keyframes: `
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }`
    },
    {
      name: 'flipInX',
      label: 'Flip In X',
      defaultDuration: 1,
      defaultTiming: 'ease-in',
      keyframes: `
  from {
    transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
    animation-timing-function: ease-in;
    opacity: 0;
  }
  40% {
    transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
    animation-timing-function: ease-in;
  }
  60% {
    transform: perspective(400px) rotate3d(1, 0, 0, 10deg);
    opacity: 1;
  }
  80% {
    transform: perspective(400px) rotate3d(1, 0, 0, -5deg);
  }
  to {
    transform: perspective(400px);
  }`
    },
    {
      name: 'swing',
      label: 'Swing',
      defaultDuration: 1,
      defaultTiming: 'ease-in-out',
      keyframes: `
  20% { transform: rotate3d(0, 0, 1, 15deg); }
  40% { transform: rotate3d(0, 0, 1, -10deg); }
  60% { transform: rotate3d(0, 0, 1, 5deg); }
  80% { transform: rotate3d(0, 0, 1, -5deg); }
  to { transform: rotate3d(0, 0, 1, 0deg); }`
    }
  ];

  // --- Computed Styles ---
  
  // Generates the full CSS block for display and copy
  generatedCss = computed(() => {
    const name = this.animationName();
    const dur = this.duration();
    const timing = this.timingFunction();
    const del = this.delay();
    const iter = this.iterationCount();
    const dir = this.direction();
    const fill = this.fillMode();
    const kf = this.keyframesBody();

    return `
.animado {
  animation-name: ${name};
  animation-duration: ${dur}s;
  animation-timing-function: ${timing};
  animation-delay: ${del}s;
  animation-iteration-count: ${iter};
  animation-direction: ${dir};
  animation-fill-mode: ${fill};
}

@keyframes ${name} {
${kf}
}`.trim();
  });

  // Generates the style tag content to inject into the DOM for the preview
  previewStyleTag = computed(() => {
     const name = this.animationName();
     const kf = this.keyframesBody();
     return `<style>
      @keyframes ${name} {
        ${kf}
      }
     </style>`;
  });

  // Style object for the preview element
  previewElementStyle = computed(() => {
    if (!this.isPlaying()) return {};
    return {
      'animation-name': this.animationName(),
      'animation-duration': `${this.duration()}s`,
      'animation-timing-function': this.timingFunction(),
      'animation-delay': `${this.delay()}s`,
      'animation-iteration-count': this.iterationCount(),
      'animation-direction': this.direction(),
      'animation-fill-mode': this.fillMode(),
    };
  });

  infoSections: InfoSection[] = [
    {
      title: 'Fundamentos da Animação CSS',
      content: `
        <h4>O que são Animações CSS?</h4>
        <p>As animações CSS permitem animar transições de uma configuração de estilo CSS para outra. Elas consistem em dois componentes: um estilo que descreve a animação (<code>animation</code>) e um conjunto de quadros-chave (<code>@keyframes</code>) que indicam os estados inicial, final e intermediários.</p>
        
        <h4>Propriedades Principais</h4>
        <ul>
          <li><strong>Duration:</strong> Quanto tempo a animação leva para completar um ciclo.</li>
          <li><strong>Timing Function:</strong> Como a animação progride (ex: <code>linear</code> é constante, <code>ease</code> começa devagar, acelera e termina devagar).</li>
          <li><strong>Iteration Count:</strong> Quantas vezes a animação deve rodar. <code>infinite</code> faz ela rodar para sempre.</li>
          <li><strong>Keyframes:</strong> A "receita" da animação. Define o que acontece em 0%, 50%, 100% do tempo.</li>
        </ul>
      `
    },
    {
      title: 'Performance e Melhores Práticas',
      content: `
        <h4>O que animar?</h4>
        <p>Para garantir 60 quadros por segundo (60fps) e uma experiência suave, prefira animar propriedades que não causam "reflow" (recalcular o layout) ou "repaint" (redesenhar pixels). As melhores propriedades para animar são:</p>
        <ul>
          <li><code>transform</code> (mover, escalar, rotacionar)</li>
          <li><code>opacity</code> (transparência)</li>
        </ul>
        <p>Evite animar propriedades como <code>width</code>, <code>height</code>, <code>margin</code> ou <code>top/left</code>, pois elas forçam o navegador a recalcular o layout da página, o que pode causar lentidão em dispositivos móveis.</p>
      `
    }
  ];

  applyPreset(preset: AnimationPreset) {
    this.animationName.set(preset.name);
    this.keyframesBody.set(preset.keyframes.trim());
    this.duration.set(preset.defaultDuration);
    this.timingFunction.set(preset.defaultTiming);
    
    // Reset dynamic properties
    this.delay.set(0);
    this.direction.set('normal');
    this.replayAnimation();
  }

  replayAnimation() {
    this.isPlaying.set(false);
    // Force reflow hack to restart animation
    setTimeout(() => {
      this.isPlaying.set(true);
    }, 50);
  }

  copyCss() {
    navigator.clipboard.writeText(this.generatedCss()).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar CSS'), 2000);
    });
  }
}
