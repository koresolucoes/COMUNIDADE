import { Injectable, signal, effect } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export interface Profile {
  id: string;
  updated_at?: string;
  username: string;
  full_name: string;
  avatar_url: string;
  favorite_tools?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  readonly session = signal<Session | null>(null);
  readonly currentUser = signal<User | null>(null);
  readonly currentUserProfile = signal<Profile | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.getSession().then(({ data: { session } }) => {
        this.session.set(session);
        this.currentUser.set(session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        this.currentUserProfile.set(null);
      }
    });

    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.fetchProfile(user.id);
      } else {
        this.currentUserProfile.set(null);
      }
    }, { allowSignalWrites: true });
  }
  
  async fetchProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, updated_at, username, full_name, avatar_url, favorite_tools')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching profile", error);
    }

    if (data && data.avatar_url) {
      data.avatar_url = this.getAvatarPublicUrl(data.avatar_url);
    }

    this.currentUserProfile.set(data);
  }

  signInWithEmail(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signInWithGoogle() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  }

  signOut() {
    this.currentUserProfile.set(null);
    return this.supabase.auth.signOut();
  }
  
  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const user = this.currentUser();
    if (!user) throw new Error('User not authenticated.');

    const updateData = {
      ...profile,
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('profiles')
      .upsert(updateData)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      if (error.message.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
        throw new Error('Este nome de usuário já está em uso.');
      }
      throw error;
    }
    
    await this.fetchProfile(user.id); // Re-fetch to update the signal with public URL
    return data;
  }

  async updateFavoriteTools(toolLinks: string[]): Promise<void> {
    const user = this.currentUser();
    if (!user) throw new Error('User not authenticated.');

    const { error } = await this.supabase
      .from('profiles')
      .update({ favorite_tools: toolLinks, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating favorite tools:', error);
      throw error;
    }

    // Update local profile signal to reflect changes immediately
    this.currentUserProfile.update(profile => {
      if (profile) {
        return { ...profile, favorite_tools: toolLinks };
      }
      return null;
    });
  }

  async uploadAvatar(file: File): Promise<string> {
    const user = this.currentUser();
    if (!user) throw new Error('User not authenticated.');
  
    const fileExt = file.name.split('.').pop();
    const newPath = `${user.id}/avatar.${fileExt}`;
  
    // Upload the new file. Upsert is good here in case of retries or overwriting.
    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(newPath, file, {
        cacheControl: '3600',
        upsert: true,
      });
  
    if (uploadError) {
      throw uploadError;
    }
    
    // After a successful upload, clean up old avatars with different extensions.
    const { data: filesInFolder, error: listError } = await this.supabase.storage
      .from('avatars')
      .list(user.id, { search: 'avatar.' });
  
    if (listError) {
      console.warn('Could not list old avatars for cleanup:', listError);
      return newPath; // Return new path anyway, cleanup is not critical
    }
    
    const newFileName = `avatar.${fileExt}`;
    const filesToRemove = filesInFolder
      .filter(f => f.name !== newFileName)
      .map(f => `${user.id}/${f.name}`);
  
    if (filesToRemove.length > 0) {
      const { error: removeError } = await this.supabase.storage
        .from('avatars')
        .remove(filesToRemove);
      
      if (removeError) {
        console.warn('Failed to remove old avatar files with different extensions:', removeError);
      }
    }
  
    return newPath;
  }

  private getAvatarPublicUrl(path: string): string | null {
    if (!path) return null;

    // Check if the path already contains a cache-busting query parameter and remove it
    const cleanPath = path.split('?')[0];
    
    const { data } = this.supabase.storage.from('avatars').getPublicUrl(cleanPath);

    // Add a new cache-busting parameter to ensure the latest version is displayed
    if (data.publicUrl) {
      return `${data.publicUrl}?t=${new Date().getTime()}`;
    }
    
    return data.publicUrl;
  }
}
