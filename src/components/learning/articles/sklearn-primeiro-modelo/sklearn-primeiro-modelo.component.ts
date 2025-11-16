import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sklearn-primeiro-modelo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sklearn-primeiro-modelo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SklearnPrimeiroModeloComponent {}
