import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TemplateService, Template } from '../../../services/template.service';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './template-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateListComponent implements OnInit {
  private templateService = inject(TemplateService);

  templates = signal<Omit<Template, 'workflow_json'>[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadTemplates();
  }

  async loadTemplates() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const templates = await this.templateService.getTemplates();
      this.templates.set(templates);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Falha ao carregar os templates.');
    } finally {
      this.loading.set(false);
    }
  }
}
