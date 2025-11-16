import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ForumService, Topic, SortBy } from '../../../services/forum.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './forum-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumListComponent implements OnInit {
  private forumService = inject(ForumService);
  public authService = inject(AuthService);

  topics = signal<Topic[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<SortBy>('updated_at');

  // Pagination state
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Computed properties for pagination
  totalPages = computed(() => Math.ceil(this.topics().length / this.itemsPerPage()));
  
  paginatedTopics = computed<Topic[]>(() => {
    const allTopics = this.topics();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return allTopics.slice(start, end);
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
    this.loadTopics();
  }

  async loadTopics() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const topics = await this.forumService.getTopics(this.activeTab());
      this.topics.set(topics);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Falha ao carregar os tópicos.');
    } finally {
      this.loading.set(false);
    }
  }

  changeTab(tab: SortBy) {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.loadTopics();
  }

  // Pagination methods
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
