import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-python-funcoes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './python-funcoes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonFuncoesComponent {}
