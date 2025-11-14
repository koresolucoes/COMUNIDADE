import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService, ContentSection, IntroductionSection, TextBlockSection, ImageSection, CodeBlockSection, TipCardSection, AdSection, TopicsSection } from '../../../services/blog.service';
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
  
  mainContent = computed(() => {
    const p = this.post();
    if (!p) return [];
    return p.content.filter(section => section.type !== 'tipCard' && section.type !== 'ad');
  });

  sidebarContent = computed(() => {
    const p = this.post();
    if (!p) return [];
    return p.content.filter(section => section.type === 'tipCard' || section.type === 'ad');
  });

  // Helper para o template saber o ícone do card
  getCardIcon(variant: 'tip' | 'note' | 'curiosity'): string {
    switch (variant) {
      case 'tip': return 'lightbulb';
      case 'note': return 'edit_note';
      case 'curiosity': return 'help_outline';
    }
  }

  // Helper para o template saber a cor do card
  getCardColorClasses(variant: 'tip' | 'note' | 'curiosity'): string {
    switch (variant) {
      case 'tip': return 'border-blue-accent/50 text-blue-300';
      case 'note': return 'border-green-accent/50 text-green-300';
      case 'curiosity': return 'border-yellow-400/50 text-yellow-300';
    }
  }
}
