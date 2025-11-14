import { Component, ChangeDetectionStrategy, signal, effect, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { BottomNavComponent } from './components/shared/bottom-nav/bottom-nav.component';
import { CommandPaletteComponent } from './components/shared/command-palette/command-palette.component';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, BottomNavComponent, CommandPaletteComponent, SidebarComponent],
  host: {
    '(keydown.meta.k)': 'toggleCommandPalette($event)',
    '(keydown.control.k)': 'toggleCommandPalette($event)',
  },
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser = this.authService.currentUser;
  isCommandPaletteVisible = signal(false);
  isDarkMode = signal(true);
  isSidebarExpanded = signal(true);

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

  toggleSidebar() {
    this.isSidebarExpanded.update(v => !v);
  }

  async onLogout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}