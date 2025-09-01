import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StorageHelper } from '../helpers/storage.helper';
import { environment } from 'src/environments/environment';
import { StorageKeys } from '../enums/storage.keys.enum';
import { AlertControllerService } from '../services/ionic/alert-controller.service';
import { remoteConfig } from 'src/environments/environment.remoteconfig';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
    providedIn: 'root',
})
export class AuthModuleGuard implements CanActivate {

    storage = inject(StorageHelper);
    alertCtrl =  inject(AlertControllerService);
    supabase = inject(SupabaseService);
    router = inject(Router);
    constructor() {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> {

        // Si la actualización forzada está desactivada, permitir acceso
        if (!remoteConfig.FEATURE_FLAGS.FORCE_UPDATE.active) {
            return of(true);
        }

        return from(this.sessionExpired()).pipe(
            map(isExpired => {
                if (!isExpired) {
                    return this.router.createUrlTree(['/onboarding']);
                }
                return true;
            }),
            catchError(() => of(false)) // En caso de error, bloquea el acceso
        );
    }

    private async sessionExpired(): Promise<boolean> {
        return await this.supabase.isSessionExpired();
    }
}
