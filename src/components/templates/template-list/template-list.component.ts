import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
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

  allTemplates = signal<Omit<Template, 'workflow_json'>[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filter and Pagination state
  categories = signal<string[]>([]);
  selectedCategory = signal<string>('all');
  currentPage = signal(1);
  itemsPerPage = signal(9);

  // Computed properties for display
  filteredTemplates = computed(() => {
    const templates = this.allTemplates();
    const category = this.selectedCategory();
    if (category === 'all') {
      return templates;
    }
    return templates.filter(t => t.category === category);
  });

  totalPages = computed(() => Math.ceil(this.filteredTemplates().length / this.itemsPerPage()));
  
  paginatedTemplates = computed(() => {
    const templates = this.filteredTemplates();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return templates.slice(start, end);
  });

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxPagesToShow = 10;
    const halfPages = Math.floor(maxPagesToShow / 2);

    if (total <= maxPagesToShow) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, current - halfPages);
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > total) {
      endPage = total;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pagesArray: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  });

  ngOnInit() {
    this.loadTemplates();
  }

  async loadTemplates() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const templates = await this.templateService.getTemplates();
      this.allTemplates.set(templates);

      const uniqueCategories = [...new Set(templates.map(t => t.category).filter(Boolean))].sort();
      this.categories.set(uniqueCategories);
      
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Falha ao carregar os templates.');
    } finally {
      this.loading.set(false);
    }
  }
  
  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.currentPage.set(1); // Reset to first page on filter change
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }
}
