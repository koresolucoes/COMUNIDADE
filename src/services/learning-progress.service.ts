import { Injectable, signal, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { UserDataService } from './user-data.service';
import { LearningPath } from './learning.service';

@Injectable({
  providedIn: 'root',
})
export class LearningProgressService {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);

  completedSteps = signal<Set<string>>(new Set());
  loading = signal(false);

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) {
        this.loadCompletedSteps();
      } else {
        this.completedSteps.set(new Set());
      }
    }, { allowSignalWrites: true });
  }

  async loadCompletedSteps() {
    this.loading.set(true);
    try {
      const steps = await this.userDataService.getCompletedSteps();
      this.completedSteps.set(new Set(steps));
    } catch (error) {
      console.error('Failed to load learning progress', error);
    } finally {
      this.loading.set(false);
    }
  }

  isStepCompleted(stepPath: string): boolean {
    return this.completedSteps().has(stepPath);
  }

  getPathProgress(path: LearningPath): { completed: number, total: number, percentage: number } {
    if (!path || path.steps.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const completedInPath = path.steps.filter(step => this.isStepCompleted(step.path)).length;
    const totalSteps = path.steps.length;
    const percentage = totalSteps > 0 ? (completedInPath / totalSteps) * 100 : 0;
    return { completed: completedInPath, total: totalSteps, percentage };
  }

  isPathCompleted(path: LearningPath): boolean {
    if (!path || path.steps.length === 0) return false;
    return this.getPathProgress(path).completed === path.steps.length;
  }

  async toggleStepCompletion(stepPath: string) {
    this.loading.set(true);
    try {
      if (this.isStepCompleted(stepPath)) {
        await this.userDataService.unmarkStepAsComplete(stepPath);
        this.completedSteps.update(steps => {
          steps.delete(stepPath);
          return new Set(steps);
        });
      } else {
        await this.userDataService.markStepAsComplete(stepPath);
        this.completedSteps.update(steps => new Set(steps.add(stepPath)));
      }
    } catch (error) {
      console.error('Failed to toggle completion status', error);
      await this.loadCompletedSteps(); 
      throw error;
    } finally {
      this.loading.set(false);
    }
  }
}
