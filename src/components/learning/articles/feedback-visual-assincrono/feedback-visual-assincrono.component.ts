
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback-visual-assincrono',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './feedback-visual-assincrono.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackVisualAssincronoComponent {
  loadingState = signal<'idle' | 'loading' | 'success'>('idle');
  
  // Toast demo state
  showToast = signal(false);

  startLoading() {
    this.loadingState.set('loading');
    setTimeout(() => {
        this.loadingState.set('success');
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 3000); // Hide toast after 3s
    }, 2000);
  }

  reset() {
    this.loadingState.set('idle');
    this.showToast.set(false);
  }
}
