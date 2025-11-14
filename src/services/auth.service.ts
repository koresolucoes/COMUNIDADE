import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  readonly session = signal<Session | null>(null);
  readonly currentUser = signal<User | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.getSession().then(({ data: { session } }) => {
        this.session.set(session);
        this.currentUser.set(session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
    });
  }
  
  signInWithEmail(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }
}
