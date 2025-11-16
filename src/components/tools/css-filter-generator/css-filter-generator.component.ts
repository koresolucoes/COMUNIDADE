import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  imports: [FormsModule, CommonModule],
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
  ];

  filters = signal<Filter[]>(JSON.parse(JSON.stringify(this.initialFilters)));

  copyButtonText = signal('Copiar CSS');

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
    };
    return nameMap[name] || name;
  }
}
