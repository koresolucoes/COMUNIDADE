import { Component, ChangeDetectionStrategy, output, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  openCommandPalette = output<void>();
  toggleTheme = output<void>();
  isDarkMode = input.required<boolean>();
}