import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sklearn-o-que-e-ml',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sklearn-o-que-e-ml.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SklearnOQueEMlComponent {}
