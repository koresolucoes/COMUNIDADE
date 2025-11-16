import { Component, ChangeDetectionStrategy, output, signal, computed, effect, viewChild, ElementRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { TemplateService } from '../../../services/template.service';
import { ForumService, Topic } from '../../../services/forum.service';

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
export class CommandPaletteComponent implements OnInit {
  close = output<void>();
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  query = signal('');
  activeIndex = signal(0);
  
  private router = inject(Router);
  private blogService = inject(BlogService);
  private templateService = inject(TemplateService);
  private forumService = inject(ForumService);

  private blogPosts = this.blogService.posts;
  private templates = this.templateService.templates;
  private forumTopics = signal<Topic[]>([]);

  private readonly staticCommands: Command[] = [
    { name: 'Início', section: 'Navegação', action: () => this.navigate('/'), icon: 'home' },
    { name: 'Blog', section: 'Navegação', action: () => this.navigate('/blog'), icon: 'article' },
    { name: 'Templates n8n', section: 'Navegação', action: () => this.navigate('/templates'), icon: 'folder_copy' },
    { name: 'Fórum', section: 'Navegação', action: () => this.navigate('/forum'), icon: 'forum' },
    { name: 'Ferramentas', section: 'Navegação', action: () => this.navigate('/tools'), icon: 'construction' },
    { name: 'Gerador de CRON', section: 'Ferramentas', action: () => this.navigate('/tools/gerador-cron'), icon: 'schedule' },
    { name: 'Formatador de JSON', section: 'Ferramentas', action: () => this.navigate('/tools/formatador-json'), icon: 'data_object' },
    { name: 'Simulador de Expressão n8n', section: 'Ferramentas', action: () => this.navigate('/tools/n8n-expression-simulator'), icon: 'play_circle' },
    { name: 'Gerenciador n8n', section: 'Ferramentas', action: () => this.navigate('/tools/gerenciador-n8n'), icon: 'hub' },
    { name: 'Testador de Regex', section: 'Ferramentas', action: () => this.navigate('/tools/testador-regex'), icon: 'spellcheck' },
    { name: 'Gerador de Dados Falsos', section: 'Ferramentas', action: () => this.navigate('/tools/gerador-dados-falsos'), icon: 'fact_check' },
    { name: 'Construtor Docker-Compose', section: 'Ferramentas', action: () => this.navigate('/tools/docker-compose-generator'), icon: 'build_circle' },
    { name: 'Codec de URL', section: 'Ferramentas', action: () => this.navigate('/tools/url-codec'), icon: 'link' },
    { name: 'Codec Base64', section: 'Ferramentas', action: () => this.navigate('/tools/base64-codec'), icon: 'password' },
    { name: 'Decoder de JWT', section: 'Ferramentas', action: () => this.navigate('/tools/jwt-decoder'), icon: 'vpn_key' },
    { name: 'Conversor de Timestamp', section: 'Ferramentas', action: () => this.navigate('/tools/timestamp-converter'), icon: 'update' },
    { name: 'Conversor de Dados', section: 'Ferramentas', action: () => this.navigate('/tools/data-converter'), icon: 'swap_horiz' },
    { name: 'Comparador de Texto', section: 'Ferramentas', action: () => this.navigate('/tools/comparador-texto'), icon: 'difference' },
    { name: 'Gerador de Hash', section: 'Ferramentas', action: () => this.navigate('/tools/gerador-hash'), icon: 'fingerprint' },
    { name: 'Gerador de Senhas', section: 'Ferramentas', action: () => this.navigate('/tools/gerador-senha'), icon: 'key' },
    { name: 'Gerador de UUID', section: 'Ferramentas', action: () => this.navigate('/tools/gerador-uuid'), icon: 'tag' },
    { name: 'Qual é o meu IP?', section: 'Ferramentas', action: () => this.navigate('/tools/meu-ip'), icon: 'location_on' },
    { name: 'Cliente REST', section: 'Ferramentas', action: () => this.navigate('/tools/cliente-rest'), icon: 'http' },
    { name: 'Verificador de DNS', section: 'Ferramentas', action: () => this.navigate('/tools/verificador-dns'), icon: 'dns' },
    { name: 'Verificador de SSL', section: 'Ferramentas', action: () => this.navigate('/tools/verificador-ssl'), icon: 'security' },
    { name: 'Testador de Webhook', section: 'Ferramentas', action: () => this.navigate('/tools/webhook-tester'), icon: 'webhook' },
  ];

  private blogCommands = computed<Command[]>(() =>
    this.blogPosts().slice(0, 5).map(post => ({
      name: post.title,
      section: 'Blog',
      action: () => this.navigate(`/blog/${post.slug}`),
      icon: 'article'
    }))
  );
  
  private templateCommands = computed<Command[]>(() =>
    this.templates().slice(0, 5).map(template => ({
      name: template.title,
      section: 'Templates n8n',
      action: () => this.navigate(`/templates/${template.id}`),
      icon: 'folder_copy'
    }))
  );

  private forumCommands = computed<Command[]>(() =>
    this.forumTopics().slice(0, 5).map(topic => ({
      name: topic.title,
      section: 'Fórum',
      action: () => this.navigate(`/forum/${topic.id}`),
      icon: 'forum'
    }))
  );

  private allCommands = computed<Command[]>(() => [
    ...this.staticCommands,
    ...this.blogCommands(),
    ...this.templateCommands(),
    ...this.forumCommands(),
  ]);

  filteredCommands = computed(() => {
    const q = this.query().toLowerCase();
    const source = q ? this.allCommands() : this.staticCommands;

    if (!q) {
      return source;
    }
    return source.filter(cmd => 
        cmd.name.toLowerCase().includes(q) || 
        cmd.section.toLowerCase().includes(q)
    );
  });

  groupedCommands = computed(() => {
    const groups: { [key: string]: Command[] } = {};
    for (const command of this.filteredCommands()) {
      if (!groups[command.section]) {
        groups[command.section] = [];
      }
      groups[command.section].push(command);
    }
    // Sort groups: Navegação, Blog, Templates, Fórum, Ferramentas
    const groupOrder = ['Navegação', 'Blog', 'Templates n8n', 'Fórum', 'Ferramentas'];
    return Object.entries(groups).sort(([a], [b]) => {
      const indexA = groupOrder.indexOf(a);
      const indexB = groupOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  });

  constructor() {
    effect(() => {
      this.searchInput()?.nativeElement.focus();
    });
  }
  
  ngOnInit(): void {
    this.blogService.loadPosts();
    this.templateService.loadTemplates();
    this.loadForumTopics();
  }

  async loadForumTopics() {
    try {
      const topics = await this.forumService.getTopics('updated_at');
      this.forumTopics.set(topics);
    } catch (e) {
      console.error('Failed to load forum topics for command palette', e);
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