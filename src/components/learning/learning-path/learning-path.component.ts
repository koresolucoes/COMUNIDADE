import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, of } from 'rxjs';
import { LearningService, LearningStep } from '../../../services/learning.service';
import { LearningProgressService } from '../../../services/learning-progress.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './learning-path.component.html',
  styleUrls: ['./learning-path.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPathComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private learningService = inject(LearningService);
  public authService = inject(AuthService);
  public learningProgressService = inject(LearningProgressService);

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

  pathProgress = computed(() => {
    const p = this.path();
    if (!p) return { completed: 0, total: 0, percentage: 0 };
    return this.learningProgressService.getPathProgress(p);
  });

  completionLoading = signal(false);
  completionError = signal<string | null>(null);

  isStepCompleted(stepPath: string): boolean {
    return this.learningProgressService.isStepCompleted(stepPath);
  }

  async toggleStepCompletion(stepPath: string) {
    if (!this.authService.currentUser()) return;
    
    this.completionLoading.set(true);
    this.completionError.set(null);
    try {
      await this.learningProgressService.toggleStepCompletion(stepPath);
    } catch (e) {
      this.completionError.set(e instanceof Error ? e.message : 'Falha ao atualizar o status.');
    } finally {
      this.completionLoading.set(false);
    }
  }
}
