import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sklearn-feature-engineering',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sklearn-feature-engineering.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SklearnFeatureEngineeringComponent {}
