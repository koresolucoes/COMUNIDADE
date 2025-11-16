import { Component, ChangeDetectionStrategy, signal, computed, viewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface AnimationOption {
  name: string;
  displayName: string;
  keyframes: string;
}

@Component({
  selector: 'app-css-animation-generator',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './css-animation-generator.component.html',
  styleUrls: ['./css-animation-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssAnimationGeneratorComponent {
  previewBox = viewChild<ElementRef<HTMLDivElement>>('previewBox');

  // --- Animation Properties ---
  selectedAnimation = signal('fadeIn');
  duration = signal(1);
  delay = signal(0);
  iterationCount = signal('1');
  direction = signal('normal');
  timingFunction = signal('ease');

  // --- UI State ---
  classCopyText = signal('Copiar Classe');
  keyframesCopyText = signal('Copiar @keyframes');

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
      // Este efeito é executado sempre que qualquer propriedade da animação muda,
      // e aciona novamente a animação.
      this.selectedAnimation();
      this.duration();
      this.delay();
      this.iterationCount();
      this.direction();
      this.timingFunction();
      
      this.replayAnimation();
    });
  }

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

  // --- Methods ---
  replayAnimation() {
    const el = this.previewBox()?.nativeElement;
    if (el) {
      el.style.animation = 'none';
      void el.offsetWidth; // Dispara um reflow para reiniciar a animação
      const newAnimation = `${this.selectedAnimation()} ${this.duration()}s ${this.timingFunction()} ${this.delay()}s ${this.iterationCount()} ${this.direction()} both`;
      el.style.animation = newAnimation;
    }
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
