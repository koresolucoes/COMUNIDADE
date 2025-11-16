import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-python-intro-ambiente',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './python-intro-ambiente.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonIntroAmbienteComponent {}
