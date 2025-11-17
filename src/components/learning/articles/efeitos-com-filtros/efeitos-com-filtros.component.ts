import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-efeitos-com-filtros',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './efeitos-com-filtros.component.html',
  styleUrls: ['./efeitos-com-filtros.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EfeitosComFiltrosComponent {}
