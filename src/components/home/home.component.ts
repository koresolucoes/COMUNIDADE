import { Component, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { TemplateService } from '../../services/template.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private blogService = inject(BlogService);
  private templateService = inject(TemplateService);
  
  quickAccessTools = [
    {
      path: '/tools/gerador-cron',
      label: 'Gerador CRON',
      icon: 'schedule',
      description: 'Crie expressões CRON de forma visual e intuitiva.'
    },
    {
      path: '/tools/formatador-json',
      label: 'Formatador JSON',
      icon: 'data_object',
      description: 'Valide, formate e minifique seu código JSON.'
    },
    {
      path: '/tools/n8n-expression-simulator',
      label: 'Simulador n8n',
      icon: 'play_circle_outline',
      description: 'Teste expressões n8n em um ambiente com dados mockados.'
    },
    {
      path: '/tools/gerador-qr-code',
      label: 'Gerador de QR Code',
      icon: 'qr_code_2',
      description: 'Crie QR codes a partir de texto ou URLs.'
    },
    {
      path: '/tools/base64-codec',
      label: 'Codec Base64',
      icon: 'password',
      description: 'Codifique ou decodifique textos e arquivos para Base64.'
    },
    {
      path: '/tools/jwt-decoder',
      label: 'Decoder JWT',
      icon: 'vpn_key',
      description: 'Inspecione o conteúdo de um JSON Web Token (JWT).'
    }
  ];

  popularTemplates = computed(() => this.templateService.templates().slice(0, 4));

  recentPosts = computed(() => this.blogService.posts().slice(0, 4));

  ngOnInit() {
    this.blogService.loadPosts();
    this.templateService.loadTemplates();
  }
}