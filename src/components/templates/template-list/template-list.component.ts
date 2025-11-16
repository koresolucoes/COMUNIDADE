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

  allTemplates = this.templateService.templates;
  loading = this.templateService.loading;
  error = signal<string | null>(null);

  // Filter and Pagination state
  selectedCategory = signal<string>('all');
  currentPage = signal(1);
  itemsPerPage = signal(9);

  categories = computed(() => {
    const templates = this.allTemplates();
    return [...new Set(templates.map(t => t.category).filter(Boolean))].sort();
  });

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
    this.templateService.loadTemplates().catch(e => {
        this.error.set(e instanceof Error ? e.message : 'Falha ao carregar os templates.');
    });
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
