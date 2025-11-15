import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Profile, AuthService } from './auth.service';

export interface Template {
  id: number;
  user_id: string;
  title: string;
  description: string;
  workflow_json: any;
  tags: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface TemplateComment {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  template_id: number;
  author?: Profile;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private supabase: SupabaseClient;
  private authService = inject(AuthService);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getTemplates(): Promise<Omit<Template, 'workflow_json'>[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('id, user_id, title, description, tags, published_at, created_at, updated_at, author:profiles(id, username, full_name, avatar_url)')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // The Supabase query may return `author` as an array `Profile[]`, but the `Template` type expects `Profile`.
    // We map over the data to fix this structure before returning it.
    return data.map((template: any) => ({
      ...template,
      author: Array.isArray(template.author) ? template.author[0] : template.author,
    }));
  }

  async getTemplateById(id: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*, author:profiles(id, username, full_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching template with id ${id}:`, error);
      throw error;
    }
    
    // Also apply the fix here to be safe, as it uses the same select pattern.
    if (data && Array.isArray((data as any).author)) {
      (data as any).author = (data as any).author[0];
    }
    
    return data;
  }

  async getComments(templateId: number): Promise<TemplateComment[]> {
    const { data, error } = await this.supabase
      .from('template_comments')
      .select('*, author:profiles(id, username, full_name, avatar_url)')
      .eq('template_id', templateId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
    
    return data.map((comment: any) => ({
      ...comment,
      author: Array.isArray(comment.author) ? comment.author[0] : comment.author,
    }));
  }

  async createComment(templateId: number, content: string): Promise<TemplateComment> {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    const { data, error } = await this.supabase
      .from('template_comments')
      .insert({
        template_id: templateId,
        content: content,
        user_id: user.id,
      })
      .select('*, author:profiles(id, username, full_name, avatar_url)')
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      throw error;
    }

    const commentData = data as any;
    if (commentData && Array.isArray(commentData.author)) {
      commentData.author = commentData.author[0];
    }
    
    return commentData;
  }
}
