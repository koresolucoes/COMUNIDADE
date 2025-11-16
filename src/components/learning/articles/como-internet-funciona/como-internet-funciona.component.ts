import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-como-internet-funciona',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './como-internet-funciona.component.html',
  styleUrls: ['./como-internet-funciona.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComoInternetFuncionaComponent {}
