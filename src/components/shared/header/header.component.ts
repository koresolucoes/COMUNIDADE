import { Component, ChangeDetectionStrategy, output, input, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { Profile } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  openCommandPalette = output<void>();
  toggleTheme = output<void>();
  logout = output<void>();
  isDarkMode = input.required<boolean>();
  user = input<User | null>();
  profile = input<Profile | null>();
  
  isProfileMenuVisible = signal(false);

  displayName = computed(() => {
    const p = this.profile();
    if (p?.username) return p.username;
    if (p?.full_name) return p.full_name;
    const u = this.user();
    if (u?.email) return u.email;
    return 'Usuário';
  });

  displayInitial = computed(() => {
    const name = this.displayName();
    return name ? name[0].toUpperCase() : '?';
  });
}
