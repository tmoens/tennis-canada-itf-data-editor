// src/app/auth/token.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import { OktaAuthService } from '@okta/okta-angular';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor( private auth: OktaAuthService ) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.auth.getAccessToken().accessToken}`
      }
    });
    return next.handle(request);
  }
}
