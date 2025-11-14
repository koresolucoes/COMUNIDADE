import { Component, ChangeDetectionStrategy, output, signal, computed, effect, viewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

interface Command {
  name: string;
  action: () => void;
  icon: string;
  section: string;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [],
  templateUrl: './command-palette.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'close.emit()',
  }
})
export class CommandPaletteComponent {
  close = output<void>();
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  query = signal('');
  commands = signal<Command[]>([]);
  activeIndex = signal(0);
  
  filteredCommands = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) {
      return this.commands();
    }
    return this.commands().filter(cmd => cmd.name.toLowerCase().includes(q));
  });

  groupedCommands = computed(() => {
    const groups: { [key: string]: Command[] } = {};
    for (const command of this.filteredCommands()) {
      if (!groups[command.section]) {
        groups[command.section] = [];
      }
      groups[command.section].push(command);
    }
    return Object.entries(groups);
  });

  constructor(private router: Router) {
    this.commands.set([
      { name: 'Início', section: 'Navegação', action: () => this.navigate('/'), icon: 'home' },
      { name: 'Blog', section: 'Navegação', action: () => this.navigate('/blog'), icon: 'article' },
      { name: 'Templates n8n', section: 'Navegação', action: () => this.navigate('/templates'), icon: 'folder_copy' },
      { name: 'Ferramentas', section: 'Navegação', action: () => this.navigate('/tools'), icon: 'construction' },
      { name: 'Gerador de CRON', section: 'Ferramentas', action: () => this.navigate('/tools/gerador-cron'), icon: 'schedule' },
      { name: 'Formatador de JSON', section: 'Ferramentas', action: () => this.navigate('/tools/formatador-json'), icon: 'data_object' },
      { name: 'Simulador de Expressão n8n', section: 'Ferramentas', action: () => this.navigate('/tools/n8n-expression-simulator'), icon: 'play_circle' },
      { name: 'Codec de URL', section: 'Ferramentas', action: () => this.navigate('/tools/url-codec'), icon: 'link' },
      { name: 'Codec Base64', section: 'Ferramentas', action: () => this.navigate('/tools/base64-codec'), icon: 'password' },
      { name: 'Decoder de JWT', section: 'Ferramentas', action: () => this.navigate('/tools/jwt-decoder'), icon: 'vpn_key' },
      { name: 'Conversor de Timestamp', section: 'Ferramentas', action: () => this.navigate('/tools/timestamp-converter'), icon: 'update' },
      { name: 'Conversor de Dados', section: 'Ferramentas', action: () => this.navigate('/tools/data-converter'), icon: 'swap_horiz' },
      { name: 'Gerador de Hash', section: 'Ferramentas', action: () => this.navigate('/tools/gerador-hash'), icon: 'fingerprint' },
      { name: 'Gerador de Senhas', section: 'Ferramentas', action: () => this.navigate('/tools/gerador-senha'), icon: 'key' },
      { name: 'Gerador de UUID', section: 'Ferramentas', action: () => this.navigate('/tools/gerador-uuid'), icon: 'tag' },
    ]);

    effect(() => {
        this.searchInput()?.nativeElement.focus();
    });
  }

  navigate(path: string) {
    this.router.navigateByUrl(path);
    this.close.emit();
  }

  executeCommand(command: Command) {
    command.action();
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update(i => (i + 1) % this.filteredCommands().length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update(i => (i - 1 + this.filteredCommands().length) % this.filteredCommands().length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const command = this.filteredCommands()[this.activeIndex()];
      if (command) {
        this.executeCommand(command);
      }
    }
  }

  onInput(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }
}