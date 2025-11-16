import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ide-console',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ide-console.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeConsoleComponent {}
