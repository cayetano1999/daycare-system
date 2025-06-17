import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Operator } from 'src/app/features/top-up/pages/validate-phone/validate-phone.component';
import { SupabaseService } from './supabase.service';

const ROUTES = {
  Base: 'https://kdvvfwiwtzrqufwtukiy.supabase.co/functions/v1',
  getOperator: (service:string, isoCode: string) => `${ROUTES.Base}/operator?isoCode=${isoCode}&service=${service}`,
}

@Injectable({
  providedIn: 'root'
})
export class OperatorService {

  supabaseService = inject(SupabaseService);
  supabaseClient = this.supabaseService.getSupabase();
  
  constructor() { }

  async getOperators(serviceId:number, isoCode: string) {
    const result = this.supabaseClient.functions.invoke('operator', {
      body: { isoCode, serviceId }
    });

    return result;
  }
}
