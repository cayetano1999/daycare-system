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

  forgotPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email);
  }

  resetPassword(newPassword: string, nonce: string) {
    return this.supabase.auth.updateUser({
      password: newPassword,
      nonce: nonce,
    });
  }


  profile() {
    return this.supabase
      .from('profiles')
      .select('id,username,full_name, website,avatar_url')
      .eq('id', this.session?.user.id)
      .single()
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  async getSession() {
    if (!this.session) {
      this.session = (await this.supabase.auth.getSession()).data.session;
    }
    return this.session;
  }

  getSupabase() {
    return this.supabase;
  }

  getRecord(table: string, columns: string[], field: string, value: string) {
    return this.supabase
      .from(table)
      .select(columns.join(','))
      .eq(field, value)
      .single();
  }

  // Generic Create
  createRecord<T>(table: string, data: T) {
    return this.supabase
      .from(table)
      .insert([data])
      .select()
      .single();
  }

  // Generic Update
  updateRecord<T>(table: string, id: string, data: Partial<T>) {
    return this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }

  // Generic Delete
  deleteRecord(table: string, id: string) {
    return this.supabase
      .from(table)
      .delete()
      .eq('id', id)
      .single();
  }
 

  async isSessionExpired(): Promise<boolean> {
    const session = await this.getSession();
    if (!session) return true;
    return (session.expires_at ?? 0) < Math.floor(Date.now() / 1000);
  }

  //Auth OTP
  signInWithPhone(phone: string) {
    return this.supabase.auth.signInWithOtp({
      phone,
    });
  }

  verifyPhoneOtp(phone: string, token: string) {
    return this.supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
  }

  //verify email otp
  verifyEmailOtp(email: string, token: string) {
    return this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
  }

}