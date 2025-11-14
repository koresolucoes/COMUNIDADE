import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
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

  ngOnInit() {
    this.blogService.loadPosts();
  }
}
