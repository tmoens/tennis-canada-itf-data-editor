import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OktaAuthService } from '@okta/okta-angular';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material';
import { RatingService } from './rating-service.service';

@Component({
  selector: 'tc-itf-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  signIn: OktaAuthService;
  router: Router;
  title = 'External Results Data Manager';
  constructor(signIn: OktaAuthService,
              router: Router,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer,
              ratingService: RatingService) {
    this.signIn = signIn;
    this.router = router;

    // The rating service is used to rate non tennis canada events, it
    // loads data here and never needs to talk to the server again.
    ratingService.loadRatings();
    }

  async logout() {
    await this.signIn.logout();
    this.router.navigateByUrl('/');
  }
}

