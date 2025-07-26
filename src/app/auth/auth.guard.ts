import {
  CanLoad,
  GuardResult,
  MaybeAsync,
  Route,
  Router,
  UrlSegment,
} from '@angular/router';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';

// export const authGuard: CanActivateFn = (route, state) => {
//   return true;
// };

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canLoad(route: Route, segments: UrlSegment[]): MaybeAsync<GuardResult> {
    return this.authService.userIsAuthenticated.pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          return this.authService.autoLogin()
        } else {
          return of(isAuthenticated);
        }
      }),
      tap((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigateByUrl('/auth');
        }
      })
    );
  }
}
