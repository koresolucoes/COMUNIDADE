import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-entendendo-json',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './entendendo-json.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntendendoJsonComponent {}