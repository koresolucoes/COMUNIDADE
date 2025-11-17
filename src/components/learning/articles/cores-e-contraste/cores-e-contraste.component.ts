import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cores-e-contraste',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cores-e-contraste.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoresEContrasteComponent {}
