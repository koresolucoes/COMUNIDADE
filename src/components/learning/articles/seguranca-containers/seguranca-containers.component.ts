import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-seguranca-containers',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './seguranca-containers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegurancaContainersComponent {}
