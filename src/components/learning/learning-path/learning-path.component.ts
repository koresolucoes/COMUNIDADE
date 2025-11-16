import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, of } from 'rxjs';
import { LearningService } from '../../../services/learning.service';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './learning-path.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPathComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private learningService = inject(LearningService);

  pathData = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('slug')),
      switchMap(slug => {
        if (!slug) {
          return of(undefined);
        }
        return of(this.learningService.getPathBySlug(slug));
      })
    )
  );

  path = computed(() => this.pathData()?.path);
}
