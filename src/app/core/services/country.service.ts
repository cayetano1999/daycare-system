import { inject, Injectable } from '@angular/core';
import { ApiService } from './api/api.service';
import { BehaviorSubject } from 'rxjs';
import { Country } from 'src/app/features/top-up/pages/validate-phone/validate-phone.component';
import { HttpClient } from '@angular/common/http';


const ROUTES = {
  Base: 'https://kdvvfwiwtzrqufwtukiy.supabase.co/functions/v1',
  getCountry: (isoCode: string) => `${ROUTES.Base}/country/${isoCode}`,
  getCountries: () => `${ROUTES.Base}/country`,
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  // countriesBehaviorSubject = new BehaviorSubject<Country[]>([]);
  httpClient = inject(HttpClient);
  constructor() { }

  getCountries(isoCode?: string) {
    const url = isoCode ? ROUTES.getCountry(isoCode) : ROUTES.getCountries();
    return this.httpClient.get<Country[]>(url);
  }

}
