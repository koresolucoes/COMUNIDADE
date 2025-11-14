import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  children?: (ChildNavItem | NavCategory)[];
}

interface ChildNavItem {
  path: string;
  label: string;
  isCategory?: false;
}

interface NavCategory {
  isCategory: true;
  label: string;
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
        { isCategory: true, label: 'Codificadores & Decodificadores' },
        { path: '/tools/url-codec', label: 'Codec de URL' },
        { path: '/tools/base64-codec', label: 'Codec Base64' },
        { path: '/tools/jwt-decoder', label: 'Decoder JWT' },
        { isCategory: true, label: 'Segurança & Criptografia' },
        { path: '/tools/gerador-hash', label: 'Gerador de Hash' },
        { path: '/tools/gerador-senha', label: 'Gerador de Senhas' },
        { path: '/tools/gerador-uuid', label: 'Gerador de UUID' },
        { isCategory: true, label: 'Rede & DevOps-Lite' },
        { path: '/tools/meu-ip', label: 'Qual é o meu IP?' },
        { path: '/tools/cliente-rest', label: 'Cliente REST' },
        { path: '/tools/verificador-dns', label: 'Verificador de DNS' },
        { path: '/tools/webhook-tester', label: 'Testador Webhook' },
        { isCategory: true, label: 'Automação & DevOps' },
        { path: '/tools/gerador-cron', label: 'Gerador CRON' },
        { path: '/tools/n8n-expression-simulator', label: 'Simulador de Expressão n8n' },
        { path: '/tools/testador-regex', label: 'Testador Regex' },
        { path: '/tools/gerador-dados-falsos', label: 'Gerador de Dados' },
        { path: '/tools/docker-compose-generator', label: 'Construtor Docker-Compose' },
        { isCategory: true, label: 'Dados & Formatação' },
        { path: '/tools/formatador-json', label: 'Formatador JSON' },
        { path: '/tools/timestamp-converter', label: 'Conversor Timestamp' },
        { path: '/tools/data-converter', label: 'Conversor de Dados' },
        { path: '/tools/comparador-texto', label: 'Comparador de Texto' },
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