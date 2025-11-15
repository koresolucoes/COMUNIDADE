import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CronGeneratorComponent } from '../tools/cron-generator/cron-generator.component';
import { JsonFormatterComponent } from '../tools/json-formatter/json-formatter.component';
import { N8nExpressionSimulatorComponent } from '../tools/n8n-expression-simulator/n8n-expression-simulator.component';
import { BlogService } from '../../services/blog.service';

type FeaturedTool = 'cron' | 'json' | 'n8n';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    CronGeneratorComponent,
    JsonFormatterComponent,
    N8nExpressionSimulatorComponent,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private blogService = inject(BlogService);
  
  featuredTool = signal<FeaturedTool>('cron');

  featuredTools: { id: FeaturedTool, name: string }[] = [
    { id: 'cron', name: 'Gerador CRON' },
    { id: 'json', name: 'Formatador JSON' },
    { id: 'n8n', name: 'Simulador n8n' },
  ];

  popularTemplates = [
    { title: 'Sincronizar Pedidos iFood com Google Sheets', apps: ['ifood', 'sheets'] },
    { title: 'Notificar no Discord sobre novos PRs no GitHub', apps: ['discord', 'github'] },
    { title: 'Criar Cartão no Trello para novos emails com Label', apps: ['trello', 'gmail'] },
    { title: 'Salvar Anexos de Email no Google Drive', apps: ['gmail', 'drive'] },
  ];

  recentPosts = computed(() => this.blogService.posts().slice(0, 4));

  ngOnInit() {
    this.blogService.loadPosts();
  }
}
