import { Injectable, signal } from '@angular/core';

export type ContentSection =
  | IntroductionSection
  | TextBlockSection
  | ImageSection
  | CodeBlockSection
  | TipCardSection
  | AdSection
  | TopicsSection;

export interface SectionBase {
  type: string;
}

export interface IntroductionSection extends SectionBase {
  type: 'introduction';
  text: string;
}

export interface TextBlockSection extends SectionBase {
  type: 'textBlock';
  title?: string;
  text: string;
}

export interface ImageSection extends SectionBase {
  type: 'image';
  src: string;
  caption?: string;
}

export interface CodeBlockSection extends SectionBase {
  type: 'codeBlock';
  language: string;
  code: string;
}

export interface TipCardSection extends SectionBase {
  type: 'tipCard';
  title: string;
  text: string;
  variant: 'tip' | 'note' | 'curiosity';
}

export interface AdSection extends SectionBase {
  type: 'ad';
  slotId: string;
}

export interface TopicsSection extends SectionBase {
  type: 'topics';
  title: string;
  items: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  author: string;
  date: string;
  summary: string;
  content: ContentSection[]; // HTML content
}

function parseAndCleanContent(content: any): ContentSection[] {
  let sections: any[] = [];

  // Step 1: Ensure content is an array
  if (typeof content === 'string') {
    try {
      sections = JSON.parse(content);
      if (!Array.isArray(sections)) {
        sections = [];
      }
    } catch (e) {
      console.error('Failed to parse blog content string:', e);
      return [{ type: 'textBlock', text: '<p>Erro: O conteúdo do post está malformado e não pôde ser analisado.</p>' }];
    }
  } else if (Array.isArray(content)) {
    sections = content;
  } else {
    return []; // Not a string or array, return empty
  }

  // Step 2: Map incorrect types and clean up sections
  const cleanedSections: ContentSection[] = sections
    .map((section: any): ContentSection | null => {
      if (!section || typeof section !== 'object') {
        return null;
      }
      
      // Remapping logic
      if (section.type === 'paragraph') {
        section.type = 'textBlock';
      } else if (section.type === '' && typeof section.text === 'string' && section.text.toLowerCase().includes('introdução')) {
        section.type = 'introduction';
        if (!section.text.trim().startsWith('<')) {
          section.text = `<p>${section.text}</p>`;
        }
      } else if (section.type === 'heading' && typeof section.text === 'string' && section.text.trim()) {
         return { type: 'textBlock', title: section.text, text: '' } as TextBlockSection;
      }
      
      const validTypes: ContentSection['type'][] = ['introduction', 'textBlock', 'image', 'codeBlock', 'tipCard', 'ad', 'topics'];
      if (validTypes.includes(section.type)) {
        return section as ContentSection;
      }
      
      return null;
    })
    .filter((section): section is ContentSection => section !== null);

  return cleanedSections;
}


@Injectable({
  providedIn: 'root',
})
export class BlogService {
  posts = signal<BlogPost[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  async loadPosts(): Promise<void> {
    if (this.posts().length > 0) return; // Não recarrega se já tiver dados
    
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await fetch('/api/blog');
      if (!response.ok) {
        throw new Error('Falha ao buscar os posts.');
      }
      const postsData: any[] = await response.json();
      const mappedPosts = postsData.map(p => {
        const cleanedContent = parseAndCleanContent(p.content);
        return { ...p, content: cleanedContent, date: p.published_at };
      });
      this.posts.set(mappedPosts);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
    } finally {
      this.loading.set(false);
    }
  }

  getPosts() {
    return this.posts.asReadonly();
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    // Tenta encontrar no cache primeiro
    const cachedPost = this.posts().find(p => p.slug === slug);
    if (cachedPost) {
      return cachedPost;
    }

    // Se não encontrar, busca na API
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await fetch(`/api/blog?slug=${slug}`);
      if (response.status === 404) {
        return undefined;
      }
      if (!response.ok) {
        throw new Error('Falha ao buscar o post.');
      }
      const postDataRaw = await response.json();
      const cleanedContent = parseAndCleanContent(postDataRaw.content);
      const postData: BlogPost = { ...postDataRaw, content: cleanedContent, date: postDataRaw.published_at };
      
      // Adiciona ou atualiza no cache para futuras navegações
      this.posts.update(posts => {
        const postIndex = posts.findIndex(p => p.slug === postData.slug);
        if (postIndex !== -1) {
          const updatedPosts = [...posts];
          updatedPosts[postIndex] = postData;
          return updatedPosts;
        }
        return [...posts, postData];
      });
      return postData;
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
      return undefined;
    } finally {
      this.loading.set(false);
    }
  }
}
