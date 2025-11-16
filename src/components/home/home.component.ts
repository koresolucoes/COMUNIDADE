import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CronGeneratorComponent } from '../tools/cron-generator/cron-generator.component';
import { JsonFormatterComponent } from '../tools/json-formatter/json-formatter.component';
import { N8nExpressionSimulatorComponent } from '../tools/n8n-expression-simulator/n8n-expression-simulator.component';
import { BlogService } from '../../services/blog.service';
import { TemplateService } from '../../services/template.service';

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
  private templateService = inject(TemplateService);
  
  featuredTool = signal<FeaturedTool>('cron');

  featuredTools: { id: FeaturedTool, name: string }[] = [
    { id: 'cron', name: 'Gerador CRON' },
    { id: 'json', name: 'Formatador JSON' },
    { id: 'n8n', name: 'Simulador n8n' },
  ];

  popularTemplates = computed(() => this.templateService.templates().slice(0, 4));

  recentPosts = computed(() => this.blogService.posts().slice(0, 4));

  ngOnInit() {
    this.blogService.loadPosts();
    this.templateService.loadTemplates();
  }
}
