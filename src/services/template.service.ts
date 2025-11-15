import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Profile } from './auth.service';

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

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private supabase: SupabaseClient;

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
    return data;
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
    return data;
  }
}
