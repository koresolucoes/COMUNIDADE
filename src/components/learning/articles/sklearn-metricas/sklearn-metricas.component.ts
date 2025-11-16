import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sklearn-metricas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sklearn-metricas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SklearnMetricasComponent {}
