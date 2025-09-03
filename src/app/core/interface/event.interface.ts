export interface FestivaEvent {
  user_id?: string;
  plan_type: 'Starter' | 'Essential' | 'Premium' | 'Elite' | '';
  event_date: string;
  event_time: string;
  name: string;
  description: string;
  share_text: string;
  url_media: string;
  image: string;
  id?: string;
  status: string;
  location: string;
  role?: string;
  owner?: boolean;
}


