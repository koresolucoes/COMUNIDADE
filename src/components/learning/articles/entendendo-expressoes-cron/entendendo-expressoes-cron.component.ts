import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-entendendo-expressoes-cron',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './entendendo-expressoes-cron.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntendendoExpressoesCronComponent {}