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
    '(click)': 'onBackdropClick($event)'
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
      { name: 'Início', section: 'Navegação', action: () => this.navigate('/'), icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12' },
      { name: 'Blog', section: 'Navegação', action: () => this.navigate('/blog'), icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5' },
      { name: 'Templates n8n', section: 'Navegação', action: () => this.navigate('/templates'), icon: 'M17.25 6.75c0 3.142-2.558 5.7-5.7 5.7S6 9.892 6 6.75' },
      { name: 'Ferramentas', section: 'Navegação', action: () => this.navigate('/tools'), icon: 'M9.594 3.94c.09-.542.56-1.007 1.11-1.11' },
      { name: 'Gerador de CRON', section: 'Ferramentas', action: () => this.navigate('/tools/gerador-cron'), icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
      { name: 'Formatador de JSON', section: 'Ferramentas', action: () => this.navigate('/tools/formatador-json'), icon: 'M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z' },
      { name: 'Simulador n8n', section: 'Ferramentas', action: () => this.navigate('/tools/n8n-expression-simulator'), icon: 'M17.25 6.75 19.5 9l-2.25 2.25m-4.5-4.5L10.5 9l2.25 2.25M7.5 15l-2.25-2.25L7.5 10.5M16.5 15l2.25-2.25-2.25-2.25' },
      { name: 'Codec de URL', section: 'Ferramentas', action: () => this.navigate('/tools/url-codec'), icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' },
      { name: 'Codec Base64', section: 'Ferramentas', action: () => this.navigate('/tools/base64-codec'), icon: 'M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662s.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.21.138-2.43.138-3.662zM15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' },
      { name: 'Decoder de JWT', section: 'Ferramentas', action: () => this.navigate('/tools/jwt-decoder'), icon: 'M15.75 5.25a3 3 0 013 3m3 0a9 9 0 11-18 0 9 9 0 0118 0zM12.75 9.75A.75.75 0 0012 9h-1.5a.75.75 0 00-.75.75v3.75a.75.75 0 00.75.75h1.5a.75.75 0 00.75-.75V9.75z' },
      { name: 'Conversor de Timestamp', section: 'Ferramentas', action: () => this.navigate('/tools/timestamp-converter'), icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
      { name: 'Conversor de Dados', section: 'Ferramentas', action: () => this.navigate('/tools/data-converter'), icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' },
    ]);

    effect(() => {
        this.searchInput()?.nativeElement.focus();
    });
  }
  
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
        this.close.emit();
    }
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