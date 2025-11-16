import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-python-listas-dicionarios',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './python-listas-dicionarios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonListasDicionariosComponent {}
