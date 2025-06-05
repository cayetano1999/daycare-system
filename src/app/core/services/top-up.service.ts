import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const ROUTES = {
  Base: 'https://kdvvfwiwtzrqufwtukiy.supabase.co/functions/v1/lookup',
  getPhoneLookup: (phoneNumber: string) => `${ROUTES.Base}/${phoneNumber}`,
}

@Injectable({
  providedIn: 'root'
})
export class TopUpService {

  httpClient = inject(HttpClient);
  constructor() { }

  getPhoneLookup(phoneNumber: string) {
    return this.httpClient.get(ROUTES.getPhoneLookup(phoneNumber));
  }
}
