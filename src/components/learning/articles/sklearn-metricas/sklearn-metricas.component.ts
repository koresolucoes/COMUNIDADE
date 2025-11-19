
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sklearn-metricas',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './sklearn-metricas.component.html',
  styleUrls: ['./sklearn-metricas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SklearnMetricasComponent {
  // --- INTERACTIVE LAB STATE ---
  readonly points = [
    { x: 10, y: 12 }, { x: 20, y: 25 }, { x: 30, y: 28 },
    { x: 40, y: 45 }, { x: 50, y: 48 }, { x: 60, y: 65 },
    { x: 70, y: 72 }, { x: 80, y: 78 }, { x: 90, y: 95 }
  ];

  slope = signal(1.0);
  intercept = signal(5.0);

  // Computed values
  predictions = computed(() => {
    const m = this.slope();
    const c = this.intercept();
    return this.points.map(p => ({
      ...p,
      predictedY: m * p.x + c,
      error: (m * p.x + c) - p.y
    }));
  });

  linePath = computed(() => {
    const m = this.slope();
    const c = this.intercept();
    const y1 = m * 0 + c;
    const y2 = m * 100 + c;
    return `M 0 ${100 - y1} L 100 ${100 - y2}`;
  });

  mae = computed(() => {
    const predData = this.predictions();
    const sumOfAbsErrors = predData.reduce((sum, p) => sum + Math.abs(p.error), 0);
    return sumOfAbsErrors / predData.length;
  });

  mse = computed(() => {
    const predData = this.predictions();
    const sumOfSquaredErrors = predData.reduce((sum, p) => sum + Math.pow(p.error, 2), 0);
    return sumOfSquaredErrors / predData.length;
  });

  rmse = computed(() => Math.sqrt(this.mse()));

  r2 = computed(() => {
    const predData = this.predictions();
    const meanY = predData.reduce((sum, p) => sum + p.y, 0) / predData.length;
    
    const ssRes = predData.reduce((sum, p) => sum + Math.pow(p.error, 2), 0);
    const ssTot = predData.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);

    if (ssTot === 0) return 1; // Perfect prediction or no variance
    
    return 1 - (ssRes / ssTot);
  });
}
