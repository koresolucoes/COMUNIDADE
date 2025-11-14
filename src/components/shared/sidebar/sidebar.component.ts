import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  isExpanded = input.required<boolean>();
  toggle = output<void>();
  currentlyOpen = signal<string | null>(null);

  navItems: NavItem[] = [
    { path: '/', label: 'Início', icon: 'home' },
    { path: '/blog', label: 'Blog', icon: 'article' },
    { path: '/templates', label: 'Templates n8n', icon: 'folder_copy' },
    { 
      path: '/tools', 
      label: 'Ferramentas', 
      icon: 'construction',
      children: [
        { path: '/tools/gerador-cron', label: 'Gerador CRON', icon: '' },
        { path: '/tools/formatador-json', label: 'Formatador JSON', icon: '' },
        { path: '/tools/n8n-expression-simulator', label: 'Simulador n8n', icon: '' },
        { path: '/tools/url-codec', label: 'Codec de URL', icon: '' },
        { path: '/tools/base64-codec', label: 'Codec Base64', icon: '' },
        { path: '/tools/jwt-decoder', label: 'Decoder JWT', icon: '' },
        { path: '/tools/timestamp-converter', label: 'Conversor Timestamp', icon: '' },
        { path: '/tools/data-converter', label: 'Conversor de Dados', icon: '' },
        { path: '/tools/webhook-tester', label: 'Testador Webhook', icon: '' },
      ]
    }
  ];

  constructor(private router: Router) {}

  toggleSubmenu(label: string) {
    if (this.currentlyOpen() === label) {
      this.currentlyOpen.set(null);
    } else {
      this.currentlyOpen.set(label);
    }
  }

  isLinkActive(path: string): boolean {
    return this.router.isActive(path, false);
  }

  handleNavigation(item: NavItem) {
    if (item.children && item.children.length > 0) {
      this.toggleSubmenu(item.label);
      this.router.navigate([item.path]);
    }
  }
}