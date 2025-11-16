import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  imports: [FormsModule, CommonModule],
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
