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
  posts = this.blogService.getPosts();

  // Pagination state
  currentPage = signal(1);
  itemsPerPage = signal(6);

  // Computed properties for pagination
  totalPages = computed(() => Math.ceil(this.posts().length / this.itemsPerPage()));
  
  paginatedPosts = computed<BlogPost[]>(() => {
    const allPosts = this.posts();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return allPosts.slice(start, end);
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
    this.blogService.loadPosts();
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
