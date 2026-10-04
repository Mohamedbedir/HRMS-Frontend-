import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';

import { inject } from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  finalize,
  switchMap,
  take,
  throwError
} from 'rxjs';

import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

const refreshTokenSubject =
  new BehaviorSubject<string | null>(null);


export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>,next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const isAuthRequest =
    req.url.includes('/Account/Login') ||
    req.url.includes('/Account/Register') ||
    req.url.includes('/Account/RefreshToken') ||
    req.url.includes('/Account/Logout');

  // Authentication endpoints don't need access token
  if (isAuthRequest) {
    return next(req);
  }

  const accessToken = tokenService.getAccessToken();

  const authRequest = accessToken
    ? addToken(req, accessToken)
    : req;

  return next(authRequest).pipe(

    catchError((error: HttpErrorResponse) => {

      // Only handle 401 Unauthorized
      if (error.status !== 401) {
        return throwError(() => error);
      }

      return handle401Error(
        req,
        next,
        tokenService,
        authService
      );
    })
  );
};


function addToken(
  request: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> {

  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}


function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: TokenService,
  authService: AuthService
): Observable<HttpEvent<unknown>> {

  // Another request is already refreshing
  if (isRefreshing) {

    return refreshTokenSubject.pipe(

      filter(
        (token): token is string => token !== null
      ),

      take(1),

      switchMap(token => {

        return next( addToken(request, token)
        );

      })
    );
  }


  // Start refresh
  isRefreshing = true;

  refreshTokenSubject.next(null);

  return authService.refreshToken().pipe(

    switchMap(response => {

      if (!response.succeeded || !response.data) {
        return throwError(
          () => new Error('Refresh token failed.')
        );
      }

      const newAccessToken =
        response.data.accessToken;

      refreshTokenSubject.next(newAccessToken);

      return next(
        addToken(request, newAccessToken)
      );

    }),

    catchError(error => {

      refreshTokenSubject.next(null);

      tokenService.clearTokens();

      authService.clearSession();

      return throwError(() => error);

    }),

    finalize(() => {
      isRefreshing = false;
    })
  );
}
/*

GET /Employees
       │
       ▼
AuthInterceptor
       │
       ├── Access Token موجود
       │
       ▼
Authorization: Bearer eyJ...
       │
       ▼
     API
       │
       ├── 200 → Response
       │
       └── 401
            │
            ▼
       Refresh Token
            │
            ▼
       New Access Token
       New Refresh Token
            │
            ▼
       Save Tokens
            │
            ▼
      Retry /Employees
            │
            ▼
           200



           ولو الـ Refresh Token انتهى؟
API → 401
 ↓
Refresh Token
 ↓
401
 ↓
Clear Tokens
 ↓
/auth/login

*/
