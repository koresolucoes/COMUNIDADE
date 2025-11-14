import { Component, ChangeDetectionStrategy, output, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  children?: NavItem[];
}

interface ToolLink {
  path: string;
  label: string;
}

interface ToolCategory {
  label: string;
  tools: ToolLink[];
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
      icon: 'construction'
    }
  ];

  toolCategories: ToolCategory[] = [
    {
      label: 'Codificadores & Decodificadores',
      tools: [
        { path: '/tools/url-codec', label: 'Codec de URL' },
        { path: '/tools/base64-codec', label: 'Codec Base64' },
        { path: '/tools/jwt-decoder', label: 'Decoder JWT' },
      ]
    },
    {
      label: 'Segurança & Criptografia',
      tools: [
        { path: '/tools/gerador-hash', label: 'Gerador de Hash' },
        { path: '/tools/gerador-senha', label: 'Gerador de Senhas' },
        { path: '/tools/gerador-uuid', label: 'Gerador de UUID' },
      ]
    },
    {
      label: 'Automação & DevOps',
      tools: [
        { path: '/tools/gerador-cron', label: 'Gerador CRON' },
        { path: '/tools/n8n-expression-simulator', label: 'Simulador de Expressão n8n' },
        { path: '/tools/webhook-tester', label: 'Testador Webhook' },
      ]
    },
    {
      label: 'Dados & Formatação',
      tools: [
        { path: '/tools/formatador-json', label: 'Formatador JSON' },
        { path: '/tools/timestamp-converter', label: 'Conversor Timestamp' },
        { path: '/tools/data-converter', label: 'Conversor de Dados' },
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