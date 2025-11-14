import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export interface ToolData {
  id: string;
  user_id: string;
  tool_id: string;
  title: string;
  data: any;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private supabase: SupabaseClient;
  private authService = inject(AuthService);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  private async getUserId(): Promise<string | null> {
    const user = this.authService.currentUser();
    if (user) {
      return user.id;
    }
    // Wait for auth state to be loaded if not available immediately
    const session = await firstValueFrom(toObservable(this.authService.session));
    return session?.user?.id ?? null;
  }

  async getSavedData(toolId: string): Promise<ToolData[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase
      .from('user_tool_data')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching data:', error);
      return [];
    }
    return data;
  }
  
  async getAllSavedData(): Promise<ToolData[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase
      .from('user_tool_data')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all data:', error);
      return [];
    }
    return data;
  }

  async saveData(toolId: string, title: string, dataToSave: any): Promise<ToolData | null> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated.');

    const { data, error } = await this.supabase
      .from('user_tool_data')
      .insert({
        user_id: userId,
        tool_id: toolId,
        title: title,
        data: dataToSave,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving data:', error);
      throw error;
    }
    return data;
  }
  
  async deleteData(id: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated.');

    const { error } = await this.supabase
      .from('user_tool_data')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  }
}