import { Injectable, signal, effect } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export interface Profile {
  id: string;
  updated_at?: string;
  username: string;
  full_name: string;
  avatar_url: string;
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
      .select('*')
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

  async uploadAvatar(file: File): Promise<string> {
    const user = this.currentUser();
    if (!user) throw new Error('User not authenticated.');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    return filePath;
  }

  private getAvatarPublicUrl(path: string): string | null {
    if (!path) return null;
    const { data } = this.supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  }
}
