import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import {MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule,
  MatFormFieldModule, MatInputModule, MatListModule, MatNativeDateModule,
  MatOptionModule, MatSelectModule, MatToolbarModule} from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OktaAuthModule, OktaCallbackComponent, OktaAuthGuard } from '@okta/okta-angular';
import { MomentDateModule } from '@angular/material-moment-adapter';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthTokenInterceptor } from './auth/AuthTokenInterceptor';

import { MessageService } from './message.service';
import { ExternalTournamentService } from './ExternalTournament.service';
import { RatingService } from './rating-service.service';

import { AppComponent } from './app.component';
import { ExternalPlayerManagerComponent } from './external-player-manager/external-player-manager.component';
import { LoginComponent } from './auth/login.component';
import { MessagesComponent } from './messages/messages.component';
import { TournamentRaterComponent } from './tournament-rater/tournament-rater.component';
import { TournamentNavigatorComponent } from './tournament-navigator/tournament-navigator.component';
import { TournamentDetailEditorComponent } from './tournament-detail-editor/tournament-detail-editor.component';
import { EventDetailEditorComponent } from './event-detail-editor/event-detail-editor.component';
import { EventResultEditorComponent } from './event-result-editor/event-result-editor.component';

import { environment } from '../environments/environment';
import { ResultsBrowserComponent } from './results-browser/results-browser.component';


export function onAuthRequired({ oktaAuth, router }) {
  // Redirect the user to your custom login page
  router.navigate(['/login']);
}

const appRoutes: Routes = [
  {
    // This particualr callback seems to take a long time
    // but I have no control over it.
    path: 'implicit/callback',
    component: OktaCallbackComponent,
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'idmapping',
    component: ExternalPlayerManagerComponent,
    canActivate: [ OktaAuthGuard ],
    data: {
      onAuthRequired
    }
  },
  {
    path: 'tournamentDataManager',
    component: TournamentNavigatorComponent,
    canActivate: [ OktaAuthGuard ],
    data: {
      onAuthRequired
    }
  },
  {
    path: 'tournamentRater',
    component: TournamentRaterComponent,
    canActivate: [ OktaAuthGuard ],
    data: {
      onAuthRequired
    }
  },
  {
    path: 'resultsBrowser',
    component: ResultsBrowserComponent,
    canActivate: [ OktaAuthGuard ],
    data: {
      onAuthRequired
    }
  },
];

@NgModule({
  declarations: [
    AppComponent,
    ExternalPlayerManagerComponent,
    MessagesComponent,
    TournamentRaterComponent,
    TournamentNavigatorComponent,
    TournamentDetailEditorComponent,
    EventDetailEditorComponent,
    EventResultEditorComponent,
    LoginComponent,
    ResultsBrowserComponent,
  ],
  entryComponents: [
    // for dialogs if we ever use them,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule, ReactiveFormsModule,
    HttpClientModule,
    FlexLayoutModule,
    MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule,
    MatFormFieldModule, MatInputModule, MatListModule, MatNativeDateModule,
    MatOptionModule, MatSelectModule, MatToolbarModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIconModule,
    MatSlideToggleModule,
    MomentDateModule,
    OktaAuthModule.initAuth(environment.oktaEnv),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [ MessageService,
    ExternalTournamentService,
    RatingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true
    }

  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
