
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-efeitos-com-filtros',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './efeitos-com-filtros.component.html',
  styleUrls: ['./efeitos-com-filtros.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EfeitosComFiltrosComponent {
  // --- Playground: Laboratório de Filtros ---
  blur = signal(0);
  brightness = signal(100);
  contrast = signal(100);
  saturate = signal(100);
  grayscale = signal(0);
  sepia = signal(0);
  hueRotate = signal(0);

  generatedFilterCss = computed(() => {
    const filters = [];
    if (this.blur() > 0) filters.push(`blur(${this.blur()}px)`);
    if (this.brightness() !== 100) filters.push(`brightness(${this.brightness()}%)`);
    if (this.contrast() !== 100) filters.push(`contrast(${this.contrast()}%)`);
    if (this.saturate() !== 100) filters.push(`saturate(${this.saturate()}%)`);
    if (this.grayscale() > 0) filters.push(`grayscale(${this.grayscale()}%)`);
    if (this.sepia() > 0) filters.push(`sepia(${this.sepia()}%)`);
    if (this.hueRotate() > 0) filters.push(`hue-rotate(${this.hueRotate()}deg)`);
    
    return filters.length > 0 ? filters.join(' ') : 'none';
  });

  resetPlayground() {
    this.blur.set(0);
    this.brightness.set(100);
    this.contrast.set(100);
    this.saturate.set(100);
    this.grayscale.set(0);
    this.sepia.set(0);
    this.hueRotate.set(0);
  }

  // --- Desafio Final: Restaurando a Foto ---
  fixContrast = signal(false);
  fixSaturation = signal(false);
  fixWarmth = signal(false); // Sepia/Hue tweak

  challengeFilter = computed(() => {
    const filters = [];
    // Estado Inicial Ruim (Foto "lavada")
    let contrast = 80;
    let saturate = 80;
    let sepia = 0;
    let brightness = 90;

    // Aplicar correções
    if (this.fixContrast()) {
      contrast = 120; // Aumenta contraste
      brightness = 110; // Compensa brilho
    }
    if (this.fixSaturation()) {
      saturate = 130; // Aumenta vivacidade
    }
    if (this.fixWarmth()) {
      sepia = 20; // Dá um tom quente sutil
    }

    filters.push(`contrast(${contrast}%)`);
    filters.push(`saturate(${saturate}%)`);
    filters.push(`brightness(${brightness}%)`);
    if (sepia > 0) filters.push(`sepia(${sepia}%)`);

    return filters.join(' ');
  });

  isChallengeComplete = computed(() => 
    this.fixContrast() && this.fixSaturation() && this.fixWarmth()
  );

  resetChallenge() {
    this.fixContrast.set(false);
    this.fixSaturation.set(false);
    this.fixWarmth.set(false);
  }
}
