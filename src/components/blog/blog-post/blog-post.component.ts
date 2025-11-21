import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService, BlogPost } from '../../../services/blog.service';
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
  // Fix: Explicitly type injected ActivatedRoute to resolve type error.
  private route: ActivatedRoute = inject(ActivatedRoute);
  blogService = inject(BlogService);

  private rawPost = toSignal(
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

  post = computed(() => {
    const p = this.rawPost();
    if (!p) return undefined;

    // HTML adjustment function to remove all inline styles, ensuring
    // consistent rendering and transparent backgrounds.
    const adjustedContent = (p.content || '').replace(/\sstyle=(['"]).*?\1/g, '');
    
    return { ...p, content: adjustedContent };
  });
}