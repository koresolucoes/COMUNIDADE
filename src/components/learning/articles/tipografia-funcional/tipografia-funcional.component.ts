import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tipografia-funcional',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tipografia-funcional.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipografiaFuncionalComponent {}
