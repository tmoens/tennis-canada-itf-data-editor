import { Component, OnInit , Input , Output, OnChanges, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

import { ExternalEvent } from '../ExternalEvent';
import { RatingService } from '../rating-service.service';
import { ExternalTournamentService } from '../ExternalTournament.service';
import {Observable} from 'rxjs/Observable';
import { VRPlayer } from '../VRPlayer';

@Component({
  selector: 'app-event-result-editor',
  templateUrl: './event-result-editor.component.html',
  styleUrls: ['./event-result-editor.component.scss']
})
export class EventResultEditorComponent implements OnInit {
  @Input() event: ExternalEvent;
  displayColumns = ['edit','delete','playerId','givenName','familyName','finishPosition', 'TCPoints'];
  failedVRPlayerLookup:boolean = false;
  vrPlayer:VRPlayer;
  numResults: number = 0;
  loadingResults = false;

  // a data object for editing a new event result
  selectedER:EventResult;

  // The list of results for our event
  results$:Observable<EventResult[]>;

  // The list of tournaments that need classification by the user
  results: EventResult[];
  resultsTD: MatTableDataSource<EventResult>;

  constructor(private tournamentService: ExternalTournamentService,
              private externalTournamentService: ExternalTournamentService,
              private ratingService: RatingService,) {
    this.selectedER = null;
    this.results = [];
    this.resultsTD = new MatTableDataSource(this.results);
  }

  ngOnInit() {
  }

  // when our event changes, we need to go get the results for this event
  ngOnChanges() {
    this.loadEventResults();
  }

  loadEventResults() {
    this.loadingResults = true;
    this.results$ = this.tournamentService.getEventResults(this.event.eventId);
    this.results$.subscribe(data => {
      this.onResultsArrival(data);
      this.loadingResults = false;
      this.selectedER = null;
    });
  }

  onResultsArrival(results) {
    this.results = results;
    this.resultsTD = new MatTableDataSource(this.results);
    for (let i = 0; i < results.length; i++) {
      results[i].tcPoints = this.calculateTCPoints(this.event.rating, results[i].finishPosition);
    }
    this.numResults=results.length;
  }

  onDelete(er) {
    this.tournamentService.deleteEventResult(er.eventId, er.playerId).subscribe((data) => {
      this.selectedER = null;
      this.loadEventResults();
    });
  }

  onSave() {
    if (this.selectedER.playerId == '') {
      this.tournamentService.addEventResult(this.selectedER).subscribe(_ => {
        this.loadEventResults();
      });
    } else {
      this.tournamentService.updateEventResult(this.selectedER).subscribe(_ => {
        this.loadEventResults();
      });
    }
  }

  onCancel() {
    this.selectedER = null;
  }

  onNewER() {
    this.selectedER = new EventResult();
    this.selectedER.eventId = this.event.eventId;
    this.selectedER.playerId = '';
    this.selectedER.finishPosition = 0;
    this.selectedER.externalRankingPoints = 0;
    this.selectedER.manualPointAllocation = 0;
    this.selectedER.vrid = '';
    this.selectedER.familyName = '';
    this.selectedER.givenName = '';
    this.selectedER.tcPoints = 0;
    this.vrPlayer = new VRPlayer();
  }

  calculateTCPoints(eventRating:number, finishPosition:number){
    if (eventRating > 0 && finishPosition > 0 ) {
      return Math.round(10000 * eventRating * Math.pow(.6, Math.log2(finishPosition)));
    } else {
      return 0;
    }
  }

  onEdit(er:EventResult) {
    this.selectedER = er;
  }

  onFinishPositionChange() {
    this.selectedER.tcPoints = this.calculateTCPoints(this.event.rating, this.selectedER.finishPosition);
  }
  // The user has manually entered a vrId
  // TODO proper form validation function
  // TODO - should not allow two results for the same player here.
  onVRIDChange(): void {
    this.failedVRPlayerLookup = false;
    let n = parseInt(this.selectedER.vrid);
    if (isNaN(n)|| (10000000 > n || 100000000 < n)) {
      return;
    }

    // The supplied VR ID syntactically valid (8 digits) - go look for the player.
    this.externalTournamentService.getVRPlayerById(this.selectedER.vrid)
      .then(player => {
        if (player != null) {
          this.vrPlayer = player;
          this.selectedER.familyName = this.vrPlayer.Lastname;
          this.selectedER.givenName = this.vrPlayer.Firstname;
        } else {
          this.failedVRPlayerLookup = true;
        }
      });
  }

}

// an event result with a bit of player information
export class EventResult {
  eventId: string;
  playerId: string;
  finishPosition: number;
  externalRankingPoints: number;
  manualPointAllocation: number;
  vrid: string;
  familyName: string;
  givenName: string;
  tcPoints:number;
}
