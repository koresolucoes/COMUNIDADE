import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LearningService } from '../../../../services/learning.service';

@Component({
  selector: 'app-learning-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './learning-navigation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningNavigationComponent {
  private learningService = inject(LearningService);
  private router = inject(Router);

  context = computed(() => {
    const url = this.router.url;
    // Remove query params se houver, para garantir match exato com o path do passo
    const path = url.split('?')[0];
    return this.learningService.getNavigationContext(path);
  });
}