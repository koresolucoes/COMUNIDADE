
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-design-de-dashboards',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './design-de-dashboards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignDeDashboardsComponent {
  // State for the interactive comparison
  showNoise = signal(true);

  toggleNoise() {
    this.showNoise.update(v => !v);
  }
}
