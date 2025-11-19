import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService, BlogPost } from '../../../services/blog.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './blog-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent implements OnInit {
  blogService = inject(BlogService);
  posts = this.blogService.posts;

  // Pagination state
  currentPage = signal(1);
  itemsPerPage = signal(6);

  // Computed properties for pagination
  totalPages = computed(() => {
    const total = this.blogService.totalPosts();
    if (total === 0) return 1; // Show at least one page
    return Math.ceil(total / this.itemsPerPage());
  });
  
  paginatedPosts = computed<BlogPost[]>(() => this.blogService.posts());

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
    this.blogService.loadPosts(this.currentPage(), this.itemsPerPage());
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.blogService.loadPosts(page, this.itemsPerPage());
    }
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }
}
