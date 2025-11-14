import { Component, ChangeDetectionStrategy, output, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeToolsMenu()'
  }
})
export class HeaderComponent {
  openCommandPalette = output<void>();
  toggleTheme = output<void>();
  isDarkMode = input.required<boolean>();

  isToolsMenuOpen = signal(false);

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

  toggleToolsMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isToolsMenuOpen.update(v => !v);
  }

  closeToolsMenu() {
    if (this.isToolsMenuOpen()) {
      this.isToolsMenuOpen.set(false);
    }
  }
}
