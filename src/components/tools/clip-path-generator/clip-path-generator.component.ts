import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  imports: [FormsModule, CommonModule],
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