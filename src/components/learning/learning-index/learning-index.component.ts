import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningService } from '../../../services/learning.service';

@Component({
  selector: 'app-learning-index',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './learning-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningIndexComponent {
  private learningService = inject(LearningService);
  mainCategories = this.learningService.getLearningData();
}
