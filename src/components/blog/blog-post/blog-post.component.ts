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

    // HTML adjustment function to selectively remove only background-related
    // inline styles, ensuring transparent backgrounds while keeping other styles.
    const adjustedContent = (p.content || '').replace(
      /\sstyle=(['"])(.*?)\1/g,
      (match, quote, styleString) => {
        if (!styleString) {
          return '';
        }

        const filteredDeclarations = styleString
          .split(';')
          .map(declaration => declaration.trim())
          .filter(declaration => {
            // Keep declarations that are valid (contain a colon)
            // AND do not start with 'background'
            return (
              declaration &&
              declaration.includes(':') &&
              !declaration.toLowerCase().startsWith('background')
            );
          });

        if (filteredDeclarations.length === 0) {
          return ''; // Remove empty style attribute
        }
        
        // Reconstruct the style string, adding a trailing semicolon for validity
        const newStyleString = filteredDeclarations.join('; ') + ';';

        return ` style="${newStyleString}"`;
      }
    );
    
    return { ...p, content: adjustedContent };
  });
}
