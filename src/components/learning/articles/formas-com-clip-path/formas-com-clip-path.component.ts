import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-formas-com-clip-path',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './formas-com-clip-path.component.html',
  styleUrls: ['./formas-com-clip-path.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormasComClipPathComponent {}
