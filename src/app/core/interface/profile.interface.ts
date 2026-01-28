export interface Profile {
  id: string;
  created_at: string; // ISO date string
  full_name: string;
  country: string | null;
  avatar_url: string | null;
  status: 'ACTIVE' | 'INACTIVE' | string; // puedes restringir más si tienes otros estados
  gender: string | null;
  device_id: string | null;
  push_token: string | null;
  device_name: string | null;
  company: any;
}
