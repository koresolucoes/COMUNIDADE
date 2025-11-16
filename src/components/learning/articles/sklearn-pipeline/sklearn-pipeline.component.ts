import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sklearn-pipeline',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sklearn-pipeline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SklearnPipelineComponent {}
