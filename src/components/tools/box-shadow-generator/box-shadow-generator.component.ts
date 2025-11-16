import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  imports: [FormsModule, CommonModule],
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