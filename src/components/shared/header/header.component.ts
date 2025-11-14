import { Component, ChangeDetectionStrategy, output, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '@supabase/supabase-js';

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
  logout = output<void>();
  isDarkMode = input.required<boolean>();
  user = input<User | null>();
  
  isProfileMenuVisible = signal(false);
}