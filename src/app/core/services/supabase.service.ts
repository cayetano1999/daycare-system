import { inject, Injectable } from '@angular/core'
import {
  AuthChangeEvent,
  AuthSession,
  // AuthTokenResponsePassword,
  createClient,
  Session,
  SupabaseClient,
  // User,
} from '@supabase/supabase-js'
import { environment } from 'src/environments/environment'
import { StorageHelper } from '../helpers/storage.helper'
// import { StorageKeys } from '../enums/storage.keys.enum'


export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient
  storageHelper = inject(StorageHelper);
  session: AuthSession | null = null

  constructor() {
    console.log(environment)
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.getSession().then(({ data }) => {
      this.session = data.session;
    });

    // Listen to auth changes (e.g., logout/login/session expiry)
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this.session = session;
    });
  }
  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  profile(id: string) {
    return this.supabase
      .from('profiles')
      .select('username, website, avatar_url')
      .eq('id', id)
      .single()
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  getSession() {
    return this.session;
  }

  getSupabase() {
    return this.supabase;
  }
}