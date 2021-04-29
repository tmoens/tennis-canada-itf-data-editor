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
  title = 'External Results Data Manager';
  constructor(private signIn: OktaAuthService,
              private router: Router,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer,
              ratingService: RatingService) {

    // The rating service is used to rate non tennis canada events, it
    // loads data here and never needs to talk to the server again.
    ratingService.loadRatings();
    }

  async logout() {
    await this.signIn.logout();
    this.router.navigateByUrl('/');
  }
}

