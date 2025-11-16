import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningService, LearningPath } from '../../../services/learning.service';

@Component({
  selector: 'app-learning-index',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './learning-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningIndexComponent {
  private learningService = inject(LearningService);
  paths = this.learningService.getLearningPaths();

  groupedPaths = computed(() => {
    const groups: { [key: string]: LearningPath[] } = {};
    for (const path of this.paths()) {
      const area = path.area;
      if (!groups[area]) {
        groups[area] = [];
      }
      groups[area].push(path);
    }
    return Object.entries(groups);
  });

  getAreaIcon(area: string): string {
    switch (area.toLowerCase()) {
      case 'n8n': return 'lan';
      case 'css': return 'palette';
      case 'devops': return 'dns';
      default: return 'school';
    }
  }
}
