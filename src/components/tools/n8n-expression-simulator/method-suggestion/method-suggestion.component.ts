import { Component, ChangeDetectionStrategy, input, output, computed, signal } from '@angular/core';
import { MethodDefinition } from '../../../../services/n8n/methods/method.interface';

@Component({
  selector: 'app-method-suggestion',
  standalone: true,
  imports: [],
  templateUrl: './method-suggestion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MethodSuggestionComponent {
  methods = input.required<MethodDefinition[]>();
  close = output<void>();
  methodSelect = output<MethodDefinition>();

  activeMethod = signal<MethodDefinition | null>(null);

  groupedMethods = computed(() => {
    const groups: { [key: string]: MethodDefinition[] } = {};
    for (const method of this.methods()) {
      const category = method.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(method);
    }
    // Ensure 'Suggested' appears before 'Other'
    return Object.entries(groups).sort(([a], [b]) => a === 'Suggested' ? -1 : (b === 'Suggested' ? 1 : a.localeCompare(b)));
  });
  
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  selectMethod(method: MethodDefinition) {
    this.methodSelect.emit(method);
  }
}
