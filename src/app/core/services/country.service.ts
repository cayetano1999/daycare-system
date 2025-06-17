import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  supabaseService = inject(SupabaseService);
  supabaseClient = this.supabaseService.getSupabase();

  constructor() { }

  async getCountries(isoCode?: string) {

    const result = this.supabaseClient.functions.invoke('country', {
      body: { isoCode }
    });

    return result;
  }
}
