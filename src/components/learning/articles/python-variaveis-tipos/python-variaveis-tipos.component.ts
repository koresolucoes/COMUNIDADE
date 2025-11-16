import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-python-variaveis-tipos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './python-variaveis-tipos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonVariaveisTiposComponent {}
