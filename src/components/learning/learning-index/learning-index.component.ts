import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningService } from '../../../services/learning.service';
import { LearningProgressService } from '../../../services/learning-progress.service';

@Component({
  selector: 'app-learning-index',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './learning-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningIndexComponent implements OnInit {
  private learningService = inject(LearningService);
  public learningProgressService = inject(LearningProgressService);
  mainCategories = this.learningService.getLearningData();

  ngOnInit(): void {
    this.learningProgressService.loadCompletedSteps();
  }
}
