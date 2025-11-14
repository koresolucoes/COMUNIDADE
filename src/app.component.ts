import { Component, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { CommandPaletteComponent } from './components/shared/command-palette/command-palette.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, CommandPaletteComponent],
  host: {
    '(keydown.meta.k)': 'toggleCommandPalette($event)',
    '(keydown.control.k)': 'toggleCommandPalette($event)',
  },
})
export class AppComponent {
  isSidebarExpanded = signal(false);
  isCommandPaletteVisible = signal(false);
  isDarkMode = signal(true);

  constructor() {
    effect(() => {
      if (this.isDarkMode()) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  toggleCommandPalette(event?: Event) {
    event?.preventDefault();
    this.isCommandPaletteVisible.update(v => !v);
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }
}
