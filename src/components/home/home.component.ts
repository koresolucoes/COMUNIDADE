import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CronGeneratorComponent } from '../tools/cron-generator/cron-generator.component';
import { JsonFormatterComponent } from '../tools/json-formatter/json-formatter.component';
import { N8nExpressionSimulatorComponent } from '../tools/n8n-expression-simulator/n8n-expression-simulator.component';
import { BlogService } from '../../services/blog.service';
import { GeminiService, AutomationInsight } from '../../services/gemini.service';

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
  private geminiService = inject(GeminiService);
  
  featuredTool = signal<FeaturedTool>('cron');
  
  // AI Insight State
  insight = signal<AutomationInsight | null>(null);
  insightLoading = signal(true);
  insightError = signal<string | null>(null);

  featuredTools: { id: FeaturedTool, name: string }[] = [
    { id: 'cron', name: 'Gerador CRON' },
    { id: 'json', name: 'Formatador JSON' },
    { id: 'n8n', name: 'Simulador n8n' },
  ];

  recentPosts = computed(() => this.blogService.posts().slice(0, 4));

  constructor() {
    effect(async () => {
      const posts = this.recentPosts();
      if (posts.length > 0 && !this.insight()) {
        this.insightLoading.set(true);
        this.insightError.set(null);
        try {
          const latestPost = posts[0];
          // We need full content, which might not be in the list view. Let's fetch it.
          const fullPost = await this.blogService.getPostBySlug(latestPost.slug);
          if (fullPost?.content) {
            const result = await this.geminiService.getAutomationInsights(fullPost.content);
            this.insight.set(result);
          } else {
             throw new Error('Não foi possível carregar o conteúdo do post para análise.');
          }
        } catch (e) {
          console.error(e);
          this.insightError.set('Falha ao gerar insights com a IA.');
        } finally {
          this.insightLoading.set(false);
        }
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.blogService.loadPosts();
  }
}