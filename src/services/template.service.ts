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
  category: string;
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

  private async getUserProfiles(userIds: string[]): Promise<Record<string, Profile>> {
    if (userIds.length === 0) return {};
    
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds);

    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }

    const profiles: Record<string, Profile> = {};
    if (data) {
      for (const profile of data) {
        if (profile.avatar_url) {
          const { data: { publicUrl } } = this.supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
          // Adiciona um parâmetro para evitar cache e garantir que o avatar mais recente seja exibido
          profile.avatar_url = publicUrl ? `${publicUrl}?t=${new Date().getTime()}` : null;
        }
        profiles[profile.id] = profile;
      }
    }
    return profiles;
  }

  async getTemplates(): Promise<Omit<Template, 'workflow_json'>[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('id, user_id, title, description, tags, category, published_at, created_at, updated_at, author:profiles(id, username, full_name, avatar_url)')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

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
    
    if (data && Array.isArray((data as any).author)) {
      (data as any).author = (data as any).author[0];
    }
    
    return data;
  }

  async getComments(templateId: number): Promise<TemplateComment[]> {
    const { data: commentsData, error } = await this.supabase
      .from('template_comments')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
    
    if (!commentsData || commentsData.length === 0) {
      return [];
    }
    
    // Fix: Ensure userIds is an array of strings by filtering out any non-string values.
    const userIds = [...new Set(commentsData.map(c => c.user_id))].filter((id): id is string => !!id);
    const profiles = await this.getUserProfiles(userIds);

    return commentsData.map((comment: any) => ({
      ...comment,
      author: profiles[comment.user_id],
    }));
  }

  async createComment(templateId: number, content: string): Promise<TemplateComment> {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    const { data: insertedComment, error } = await this.supabase
      .from('template_comments')
      .insert({
        template_id: templateId,
        content: content,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      throw error;
    }

    const profiles = await this.getUserProfiles([insertedComment.user_id]);
    
    return {
      ...insertedComment,
      author: profiles[insertedComment.user_id],
    };
  }
}