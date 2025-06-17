import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';

const ROUTES = {
  Base: 'https://kdvvfwiwtzrqufwtukiy.supabase.co/functions/v1/lookup',
  getPhoneLookup: (phoneNumber: string) => `${ROUTES.Base}/${phoneNumber}`,
}

@Injectable({
  providedIn: 'root'
})
export class TopUpService {

  supabaseService = inject(SupabaseService);
  supabaseClient = this.supabaseService.getSupabase();

  constructor() { }

  async getPhoneLookup(phoneNumber: string) {
    const result = this.supabaseClient.functions.invoke('lookup', {
      body: { phoneNumber }
    });

    return result;
  }
}
