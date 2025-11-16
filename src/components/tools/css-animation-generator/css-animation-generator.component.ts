import { Component, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolInfoSectionComponent, InfoSection } from '../../shared/tool-info-section/tool-info-section.component';

interface AnimationOption {
  name: string;
  displayName: string;
  keyframes: string;
}

@Component({
  selector: 'app-css-animation-generator',
  standalone: true,
  imports: [FormsModule, CommonModule, ToolInfoSectionComponent],
  templateUrl: './css-animation-generator.component.html',
  styleUrls: ['./css-animation-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssAnimationGeneratorComponent {
  // --- Animation Properties ---
  selectedAnimation = signal('fadeIn');
  duration = signal(1);
  delay = signal(0);
  iterationCount = signal('1');
  direction = signal('normal');
  timingFunction = signal('ease');

  // --- UI State ---
  activeAnimationName = signal(''); // Changed: controls the live animation-name
  classCopyText = signal('Copiar Classe');
  keyframesCopyText = signal('Copiar @keyframes');

  // --- Computed CSS ---
  animationClassCss = computed(() => {
    return `
.animated-element {
  animation-name: ${this.selectedAnimation()};
  animation-duration: ${this.duration()}s;
  animation-timing-function: ${this.timingFunction()};
  animation-delay: ${this.delay()}s;
  animation-iteration-count: ${this.iterationCount()};
  animation-direction: ${this.direction()};
  animation-fill-mode: both;
}
    `.trim();
  });

  animationKeyframesCss = computed(() => {
    return this.animations.find(a => a.name === this.selectedAnimation())?.keyframes || '';
  });

  // FIX: Converted infoSections to a computed signal to resolve initialization order errors and make example code dynamic.
  infoSections = computed<InfoSection[]>(() => [
    {
        title: 'Introdução e Valor da Ferramenta',
        content: `
            <h4>O que é o Gerador de Animação CSS?</h4>
            <p>Esta ferramenta oferece uma coleção de animações CSS pré-construídas que você pode personalizar e aplicar aos seus projetos. Ela permite que você ajuste propriedades como duração, atraso, repetição e curva de aceleração, e gera tanto a classe CSS quanto a regra <code>@keyframes</code> necessária para a animação funcionar.</p>
            
            <h4>Por que usar Animações CSS?</h4>
            <p>Animações dão vida às interfaces, tornando a experiência do usuário mais agradável e intuitiva. Elas são excelentes para:</p>
            <ul>
                <li>Fornecer feedback visual para ações do usuário (ex: um item tremendo ao falhar a validação).</li>
                <li>Chamar a atenção para elementos importantes (ex: um botão pulsando).</li>
                <li>Criar transições de página ou de estado mais suaves e elegantes.</li>
                <li>Adicionar um toque de personalidade e polimento ao seu design.</li>
            </ul>

            <h4>Características ⚡️</h4>
            <ul>
                <li><strong>Biblioteca de Presets:</strong> Escolha entre animações populares como Fade, Slide, Bounce e Pulse.</li>
                <li><strong>Personalização Completa:</strong> Controle a duração, atraso, número de repetições, direção e a curva de tempo da animação.</li>
                <li><strong>Pré-visualização e Repetição:</strong> Veja sua animação em ação e repita-a com um clique.</li>
                <li><strong>Código Separado:</strong> Copie a classe CSS e os <code>@keyframes</code> separadamente para uma melhor organização do seu código.</li>
            </ul>
        `
    },
    {
        title: 'Guia de Uso e Exemplos',
        content: `
            <h4>Como Usar o Gerador de Animações</h4>
            <ol>
                <li><strong>Escolha uma Animação:</strong> Selecione um dos presets no menu "Animação". A pré-visualização será atualizada automaticamente.</li>
                <li><strong>Ajuste as Propriedades:</strong> Use os sliders e menus para customizar a duração (em segundos), o atraso antes de iniciar, o número de repetições, a direção e a curva de aceleração (timing-function).</li>
                <li><strong>Teste a Animação:</strong> Clique no botão "Repetir Animação" a qualquer momento para ver o resultado de suas customizações.</li>
                <li><strong>Copie o Código:</strong>
                    <ul>
                        <li>Clique em "Copiar @keyframes" e cole essa regra no seu arquivo CSS principal. Você só precisa fazer isso uma vez por tipo de animação.</li>
                        <li>Clique em "Copiar Classe" e adicione a classe <code>.animated-element</code> (ou renomeie-a) ao elemento HTML que você deseja animar.</li>
                    </ul>
                </li>
            </ol>
            
            <h4>Integrando em seu Projeto</h4>
            <p><strong>1. Adicione os @keyframes ao seu CSS:</strong></p>
            <pre><code>${this.animationKeyframesCss()}</code></pre>
            <p><strong>2. Adicione a classe ao seu CSS e aplique-a ao seu HTML:</strong></p>
            <pre><code>${this.animationClassCss()}

&lt;div class="animated-element"&gt;Olá, Mundo!&lt;/div&gt;
</code></pre>
        `
    },
    {
        title: 'Melhores Práticas e Contexto Técnico',
        content: `
            <h4>Performance é Essencial</h4>
            <p>Para animações suaves (60fps), o navegador deve evitar operações custosas como "layout" e "paint". As propriedades mais performáticas para animar são <code>transform</code> e <code>opacity</code>, pois elas podem ser aceleradas pela GPU.</p>
            <ul>
                <li><strong>Prefira:</strong> Animações que usam <code>transform: translateX()</code>, <code>transform: scale()</code>, ou <code>opacity</code> (como 'Fade In' e 'Slide In').</li>
                <li><strong>Use com Cuidado:</strong> Animações que alteram propriedades como <code>width</code>, <code>height</code>, <code>top</code>, <code>left</code>, ou <code>box-shadow</code>, pois elas forçam o navegador a recalcular o layout e repintar a tela, o que pode causar "engasgos".</li>
            </ul>

            <h4>Acessibilidade com <code>prefers-reduced-motion</code></h4>
            <p>Alguns usuários podem ter sensibilidade a movimento e preferem desativar animações. É uma boa prática respeitar essa preferência usando a media query <code>prefers-reduced-motion</code> para desabilitar ou reduzir a intensidade das animações.</p>
            <pre><code>@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
</code></pre>
        `
    },
    {
        title: 'Perguntas Frequentes (FAQ)',
        content: `
            <h4>Qual a diferença entre <code>animation</code> e <code>transition</code>?</h4>
            <p><code>transition</code> é usada para animar a mudança de um estado para outro (ex: de uma cor para outra no <code>:hover</code>). <code>animation</code> é mais poderosa e usa <code>@keyframes</code> para definir múltiplos estágios de uma animação complexa, sem depender de uma mudança de estado.</p>
            
            <h4>O que é a propriedade <code>animation-fill-mode</code>?</h4>
            <p>Ela define como o elemento se parece antes e depois da animação. O valor <code>both</code>, usado por este gerador, garante que o estilo do primeiro keyframe seja aplicado antes do início da animação (respeitando o <code>animation-delay</code>) e que o estilo do último keyframe permaneça após o fim da animação.</p>

            <h4>Posso combinar animações?</h4>
            <p>Sim, você pode aplicar múltiplas animações a um elemento separando os valores por vírgula. Exemplo: <code>animation: slideInLeft 1s, fadeIn 1s;</code>. No entanto, gerenciar isso pode se tornar complexo rapidamente.</p>
        `
    }
]);

  // --- Animation Definitions ---
  animations: AnimationOption[] = [
    { name: 'fadeIn', displayName: 'Fade In', keyframes: `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }` },
    { name: 'slideInLeft', displayName: 'Slide In (Esquerda)', keyframes: `@keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }` },
    { name: 'slideInRight', displayName: 'Slide In (Direita)', keyframes: `@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }` },
    { name: 'bounce', displayName: 'Bounce', keyframes: `@keyframes bounce { 0%, 20%, 53%, 80%, 100% { transform: translateY(0); } 40%, 43% { transform: translateY(-30px); } 70% { transform: translateY(-15px); } 90% { transform: translateY(-4px); } }` },
    { name: 'pulse', displayName: 'Pulse', keyframes: `@keyframes pulse { from { transform: scale3d(1, 1, 1); } 50% { transform: scale3d(1.05, 1.05, 1.05); } to { transform: scale3d(1, 1, 1); } }` },
    { name: 'tada', displayName: 'Tada', keyframes: `@keyframes tada { from { transform: scale3d(1, 1, 1); } 10%, 20% { transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg); } 30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); } 40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); } to { transform: scale3d(1, 1, 1); } }`},
    { name: 'shake', displayName: 'Shake', keyframes: `@keyframes shake { from, to { transform: translate3d(0, 0, 0); } 10%, 30%, 50%, 70%, 90% { transform: translate3d(-10px, 0, 0); } 20%, 40%, 60%, 80% { transform: translate3d(10px, 0, 0); } }`},
  ];
  
  constructor() {
    effect(() => {
      // Track all animation properties. When any change, trigger a restart.
      this.selectedAnimation();
      this.duration();
      this.delay();
      this.iterationCount();
      this.direction();
      this.timingFunction();
      
      this.replayAnimation();
    }, { allowSignalWrites: true });
  }

  // --- Methods ---
  replayAnimation(): void {
    // Set to 'none' to stop the current animation
    this.activeAnimationName.set('none');
    
    // Use setTimeout to re-apply the animation name in the next browser tick.
    // This forces the browser to restart the animation.
    setTimeout(() => {
      this.activeAnimationName.set(this.selectedAnimation());
    }, 0);
  }
  
  copyCss(type: 'class' | 'keyframes') {
    const textToCopy = type === 'class' ? this.animationClassCss() : this.animationKeyframesCss();
    const signalToUpdate = type === 'class' ? this.classCopyText : this.keyframesCopyText;
    const originalText = type === 'class' ? 'Copiar Classe' : 'Copiar @keyframes';

    navigator.clipboard.writeText(textToCopy).then(() => {
      signalToUpdate.set('Copiado!');
      setTimeout(() => signalToUpdate.set(originalText), 2000);
    });
  }
}
