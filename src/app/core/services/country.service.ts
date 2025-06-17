import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Country } from '../models/country.type';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  supabaseService = inject(SupabaseService);
  supabaseClient = this.supabaseService.getSupabase();

  constructor() { }

  async getCountries(isoCode?: string) {

    const {data, error} = await this.supabaseClient.functions.invoke<Country[]>('country', {
      body: { isoCode }
    });

    return data??[];
  }
}
