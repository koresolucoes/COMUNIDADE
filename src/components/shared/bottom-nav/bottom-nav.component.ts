import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  navItems: NavItem[] = [
    { path: '/', label: 'Início', icon: 'home' },
    { path: '/blog', label: 'Blog', icon: 'article' },
    { path: '/forum', label: 'Fórum', icon: 'forum' },
    { path: '/templates', label: 'Templates', icon: 'folder_copy' },
    { path: '/tools', label: 'Ferramentas', icon: 'construction' }
  ];
}
