import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CronGeneratorComponent } from '../tools/cron-generator/cron-generator.component';
import { JsonFormatterComponent } from '../tools/json-formatter/json-formatter.component';
import { N8nExpressionSimulatorComponent } from '../tools/n8n-expression-simulator/n8n-expression-simulator.component';

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
export class HomeComponent {
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

  recentPosts = [
    { title: 'Como debuguei um webhook que não retornava 200', type: 'Artigo', link: '/blog' },
    { title: 'Template: Sincronizar Calendários Google e Outlook', type: 'Template', link: '/templates' },
    { title: 'Automatizando Relatórios Financeiros com n8n', type: 'Artigo', link: '/blog' },
    { title: 'Top 5 Nós do n8n que Você Precisa Conhecer', type: 'Artigo', link: '/blog' },
  ];
}
