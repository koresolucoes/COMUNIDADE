import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-fundos-impactantes-gradientes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './fundos-impactantes-gradientes.component.html',
  styleUrls: ['./fundos-impactantes-gradientes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundosImpactantesGradientesComponent {}
