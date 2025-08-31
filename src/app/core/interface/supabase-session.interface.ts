export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  user: SupabaseUser;
  token_type: string; // e.g. "bearer"
  expires_in: number; // seconds
  expires_at: number; // epoch seconds
}

export interface SupabaseUser {
  id: string;
  aud: string; // "authenticated"
  role: string; // "authenticated"
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface AppMetadata {
  provider: string;           // "google"
  providers: string[];        // ["google"]
}

export interface UserMetadata {
  avatar_url: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  iss: string;                // issuer, e.g. "https://accounts.google.com"
  name: string;
  phone_verified: boolean;
  picture: string;
  provider_id: string;        // Google sub as string
  sub: string;                // subject (same as provider_id)
}

export interface Identity {
  identity_id: string;
  id: string;                 // provider user id
  user_id: string;            // Supabase user id
  identity_data: IdentityData;
  provider: string;           // "google"
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface IdentityData {
  avatar_url: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  iss: string;
  name: string;
  phone_verified: boolean;
  picture: string;
  provider_id: string;
  sub: string;
}
