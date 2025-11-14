import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CronGeneratorComponent } from '../tools/cron-generator/cron-generator.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CronGeneratorComponent, RouterLink],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
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
