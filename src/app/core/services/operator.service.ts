import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Operator } from 'src/app/features/top-up/pages/validate-phone/validate-phone.component';

const ROUTES = {
  Base: 'https://kdvvfwiwtzrqufwtukiy.supabase.co/functions/v1',
  getOperator: (service:string, isoCode: string) => `${ROUTES.Base}/operator?isoCode=${isoCode}&service=${service}`,
}

@Injectable({
  providedIn: 'root'
})
export class OperatorService {

  // countriesBehaviorSubject = new BehaviorSubject<Country[]>([]);
  httpClient = inject(HttpClient);
  constructor() { }

  getOperators(service:string, isoCode: string) {
    return this.httpClient.get<Operator[]>(ROUTES.getOperator(service,isoCode));
  }

}
