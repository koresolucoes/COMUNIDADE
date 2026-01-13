import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-http-apis',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './http-apis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpApisComponent {}