import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-introducao-pseudocodigo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './introducao-pseudocodigo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroducaoPseudocodigoComponent {}
