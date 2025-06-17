import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageHelper } from '../helpers/storage.helper';
import { StorageKeys } from '../enums/storage.keys.enum';
import { SupabaseService } from '../services/supabase.service';
import { NavController } from '@ionic/angular';
import { routes } from 'src/app/app.routes';
import { RoutesApp } from '../enums/routes.enum';

@Injectable({
  providedIn: 'root',
})
export class SessiongGuard implements CanActivate {
  constructor(private supabase: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const session = await this.supabase.getSession();

    if (session) {
      return true;
    } else {
      const { data } = await this.supabase.getSupabase().auth.getSession();
      if (data.session) return true;

      this.router.navigate(['/login']);
      return false;
    }
  }
}
