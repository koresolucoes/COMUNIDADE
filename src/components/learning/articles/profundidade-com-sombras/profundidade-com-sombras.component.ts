import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profundidade-com-sombras',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profundidade-com-sombras.component.html',
  styleUrls: ['./profundidade-com-sombras.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfundidadeComSombrasComponent {
  shadowSimple = `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);`;
}
