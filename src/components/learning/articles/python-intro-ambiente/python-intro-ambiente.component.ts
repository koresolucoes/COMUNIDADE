
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PythonConsoleComponent } from '../../../shared/python-console/python-console.component';

@Component({
  selector: 'app-python-intro-ambiente',
  standalone: true,
  imports: [RouterLink, PythonConsoleComponent],
  templateUrl: './python-intro-ambiente.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonIntroAmbienteComponent {
  // O componente agora é "stateless" em relação à lógica do console,
  // pois delegamos tudo para o PythonConsoleComponent.
}
