

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

  async getCompletedSteps(): Promise<string[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase
      .from('user_learning_progress')
      .select('step_path')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching completed steps:', error);
      return [];
    }
    return data.map(item => item.step_path);
  }

  async markStepAsComplete(stepPath: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated.');

    const { error } = await this.supabase
      .from('user_learning_progress')
      .insert({
        user_id: userId,
        step_path: stepPath,
      });

    if (error) {
      console.error('Error marking step as complete:', error);
      throw error;
    }
  }

  async unmarkStepAsComplete(stepPath: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated.');

    const { error } = await this.supabase
      .from('user_learning_progress')
      .delete()
      .match({
        user_id: userId,
        step_path: stepPath,
      });

    if (error) {
      console.error('Error unmarking step as complete:', error);
      throw error;
    }
  }

  // --- New Interactive Learning Methods ---

  async getLessonProgress(lessonId: string): Promise<any> {
    const userId = await this.getUserId();
    if (!userId) return null;

    const { data, error } = await this.supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
      console.error('Error fetching lesson progress:', error);
    }
    return data;
  }

  async updateLessonProgress(lessonId: string, status: 'started' | 'completed', score: number = 0, metadata: any = {}): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated.');

    const { error } = await this.supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        status,
        score,
        metadata,
        updated_at: new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : undefined
      }, { onConflict: 'user_id, lesson_id' });

    if (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    }
  }
}