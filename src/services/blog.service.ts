import { Injectable, signal } from '@angular/core';

export interface BlogPost {
  slug: string;
  title: string;
  author: string;
  date: string;
  summary: string;
  content: string; // HTML content
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  posts = signal<BlogPost[]>([]);
  totalPosts = signal(0);
  loading = signal(false);
  error = signal<string | null>(null);

  async loadPosts(page: number = 1, limit: number = 6): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await fetch(`/api/blog?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar os posts.');
      }
      const { data, count } = await response.json();
      const postsData: any[] = data || [];
      const mappedPosts = postsData.map(p => ({ ...p, date: p.published_at }));
      this.posts.set(mappedPosts);
      this.totalPosts.set(count || 0);
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
    // Tenta encontrar no cache da página atual primeiro
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
      const postData: BlogPost = { ...postDataRaw, date: postDataRaw.published_at };
      
      // Não adiciona ao cache da lista para não interferir na paginação
      return postData;
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
      return undefined;
    } finally {
      this.loading.set(false);
    }
  }
}
