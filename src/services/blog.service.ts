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
      const mappedPosts = postsData.map(p => ({ ...p, date: p.published_at }));
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
      const postData: BlogPost = { ...postDataRaw, date: postDataRaw.published_at };
      
      // Adiciona ao cache para futuras navegações
      this.posts.update(posts => {
        const postExists = posts.some(p => p.slug === postData.slug);
        if (!postExists) {
          return [...posts, postData];
        }
        return posts;
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