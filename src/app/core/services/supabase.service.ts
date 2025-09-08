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
import { Capacitor } from '@capacitor/core'
// import { StorageKeys } from '../enums/storage.keys.enum'



@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient
  storageHelper = inject(StorageHelper);
  session: AuthSession | null = null

  constructor() {
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
      .from('user_profiles')
      .select('*')
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
      .maybeSingle();
  }

  getRecords<T>(table: string, columns: string[], field: string, value: string, orderProperty: string) {
    return this.supabase
      .from(table)
      .select(columns.join(','))
      .eq(field, value)
      .order(orderProperty, { ascending: false });

  }

  // Generic Create
  createRecord<T>(table: string, data: T) {
    return this.supabase
      .from(table)
      .insert([data])
      .select()
      .single();
  }

  createRecordWithoutSelect<T>(table: string, data: T[]) {
    return this.supabase
      .from(table)
      .insert(data);
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
      .maybeSingle();

    //  return  this.supabase.from(table).delete().eq('id', id);
  }

  async deleteTableSafely(tableId: string) {
    const { data, error } = await this.supabase.rpc('delete_event_table_safely', { p_table_id: tableId });
    if (error) throw error;
    return data; // null
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

  signInWithGoogle() {
    const platform = Capacitor.getPlatform();
    return this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `festivaappmobile://login-callback`,
        // @ts-ignore → para ignorar el error de TS
        flow: 'pkce'
      },
    });
  }

  //sigInWithApple 

  signInWithApple() {
    const platform = Capacitor.getPlatform();
    return this.supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `festivaappmobile://login-callback`,
        // @ts-ignore → para ignorar el error de TS
        flow: 'pkce',
        scopes: 'name email'
      },
    });
  }

  // 1) SignUp con email/clave (crea el usuario en Auth)
  async signUpWithEmail(opts: { email: string; password: string; full_name: string; phone: string }) {
    const { email, password, full_name, phone } = opts;

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        // metadata va al user_metadata de Auth (útil para saludar antes de tener profile)
        data: { full_name, phone },
        // si confirmación por correo está activa, Supabase redirigirá aquí
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;

    //update user


  }

  sendEmailOtp(email: string) {
    return this.supabase.auth.signInWithOtp({
      email,
    });
  }

  sendPushNotification(token: string, title: string, body: string, image?: string, data?: any) {
    return this.supabase.functions.invoke('send-push_notification', {
      body: {
        token,
        title,
        body,
        image,
        data,
        priority: 'high',
      }
    });
  }

  



}