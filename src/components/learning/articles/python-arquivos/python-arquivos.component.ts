import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-python-arquivos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './python-arquivos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonArquivosComponent {}
