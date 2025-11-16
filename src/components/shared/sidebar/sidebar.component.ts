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
  icon: string;
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
    { path: '/profile', label: 'Meu Perfil', icon: 'person' },
    { path: '/blog', label: 'Blog', icon: 'article' },
    { path: '/templates', label: 'Templates n8n', icon: 'folder_copy' },
    { path: '/forum', label: 'Fórum', icon: 'forum' },
    { 
      path: '/tools', 
      label: 'Ferramentas', 
      icon: 'construction',
      children: [
        { isCategory: true, label: 'CSS & Layout', icon: 'palette' },
        { path: '/tools/gerador-box-shadow', label: 'Gerador de Box Shadow' },
        { path: '/tools/gerador-gradiente-css', label: 'Gerador de Gradiente' },
        { path: '/tools/gerador-clip-path', label: 'Gerador de Clip-Path' },
        { path: '/tools/construtor-grid-css', label: 'Construtor de Grid' },
        { path: '/tools/gerador-filtros-css', label: 'Gerador de Filtros' },
        { path: '/tools/gerador-animacao-css', label: 'Gerador de Animação' },
        { isCategory: true, label: 'Codificadores & Decodificadores', icon: 'code' },
        { path: '/tools/url-codec', label: 'Codec de URL' },
        { path: '/tools/base64-codec', label: 'Codec Base64' },
        { path: '/tools/jwt-decoder', label: 'Decoder JWT' },
        { isCategory: true, label: 'Segurança & Criptografia', icon: 'security' },
        { path: '/tools/gerador-hash', label: 'Gerador de Hash' },
        { path: '/tools/gerador-senha', label: 'Gerador de Senhas' },
        { path: '/tools/gerador-uuid', label: 'Gerador de UUID' },
        { isCategory: true, label: 'Rede & DevOps-Lite', icon: 'public' },
        { path: '/tools/meu-ip', label: 'Qual é o meu IP?' },
        { path: '/tools/cliente-rest', label: 'Cliente REST' },
        { path: '/tools/verificador-dns', label: 'Verificador de DNS' },
        { path: '/tools/verificador-ssl', label: 'Verificador de SSL' },
        { path: '/tools/webhook-tester', label: 'Testador Webhook' },
        { isCategory: true, label: 'Automação & DevOps', icon: 'lan' },
        { path: '/tools/gerador-cron', label: 'Gerador CRON' },
        { path: '/tools/n8n-expression-simulator', label: 'Simulador de Expressão n8n' },
        { path: '/tools/gerenciador-n8n', label: 'Gerenciador n8n' },
        { path: '/tools/testador-regex', label: 'Testador Regex' },
        { path: '/tools/gerador-dados-falsos', label: 'Gerador de Dados' },
        { path: '/tools/docker-compose-generator', label: 'Construtor Docker-Compose' },
        { isCategory: true, label: 'Dados & Formatação', icon: 'dataset' },
        { path: '/tools/formatador-json', label: 'Formatador JSON' },
        { path: '/tools/timestamp-converter', label: 'Conversor Timestamp' },
        { path: '/tools/data-converter', label: 'Conversor de Dados' },
        { path: '/tools/comparador-texto', label: 'Comparador de Texto' },
        { path: '/tools/gerador-qr-code', label: 'Gerador de QR Code' },
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