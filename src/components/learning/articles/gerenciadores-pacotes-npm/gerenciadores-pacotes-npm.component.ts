import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gerenciadores-pacotes-npm',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './gerenciadores-pacotes-npm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GerenciadoresPacotesNpmComponent {}
