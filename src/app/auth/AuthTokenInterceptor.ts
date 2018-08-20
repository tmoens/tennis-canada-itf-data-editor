/**
 * 2018-02-17 Ted Moens
 * This just intercepts the outbount http requests and inserts the jwt
 * More efficient than doing it in every single http request.
 */
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import { OktaAuthService } from '@okta/okta-angular';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor( private auth: OktaAuthService ) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    /*
     * The app is allowed to send some requests to the server even if the
     * user is not authenticated.  If we use auth.getAccessToken unconditionally,
     * we basically force a login before the first request is sent to the server.
     * So we only add the token if the user is authenticated.
     */
    if (this.auth.isAuthenticated()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.getAccessToken().accessToken}`
        }
      });
    }
    return next.handle(request);
  }
}
