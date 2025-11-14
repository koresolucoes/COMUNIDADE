import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, of } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, SafeHtmlPipe, DatePipe],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostComponent {
  private route = inject(ActivatedRoute);
  blogService = inject(BlogService);

  post = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('slug')),
      switchMap(slug => {
        if (!slug) {
          return of(undefined);
        }
        return from(this.blogService.getPostBySlug(slug));
      })
    )
  );
}
