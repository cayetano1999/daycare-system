import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Product } from '../models/product.type';
import { Operator } from '../models/operator.type';
import { ServiceType } from '../enums/service-type.enum';

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

  async getOperators(serviceType: ServiceType, isoCode: string) {
    const {data, error} = await this.supabaseClient.functions.invoke<Operator[]>('operator', {
      body: { isoCode, serviceId: serviceType }
    });

    return data??[];
  }

  async getProductAmmounts(serviceType: ServiceType, isoCode: string, operatorId: number) {
    const {data, error} = await this.supabaseClient.functions.invoke<Product[]>('products', {
      body: { isoCode, serviceId: serviceType, operatorId }
    });

    return data?.map(product=> product.source);
  }
}
