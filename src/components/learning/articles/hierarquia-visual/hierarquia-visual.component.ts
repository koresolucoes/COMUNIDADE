import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hierarquia-visual',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hierarquia-visual.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HierarquiaVisualComponent {}
