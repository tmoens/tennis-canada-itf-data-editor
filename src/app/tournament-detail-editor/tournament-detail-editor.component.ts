import { Component, OnInit , Input , Output, OnChanges, EventEmitter } from '@angular/core';
import {  FormControl } from '@angular/forms';

import { ExternalTournament } from '../ExternalTournament';
import { RatingService } from '../rating-service.service';
import { ExternalTournamentService } from '../ExternalTournament.service';
// import {MAT_DATE_FORMATS} from '@angular/material/core';
import * as moment from 'moment';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

const TEST_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'YYYY-MM-DD',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-tournament-detail-editor',
  templateUrl: './tournament-detail-editor.component.html',
  styleUrls: ['./tournament-detail-editor.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: TEST_FORMATS},
  ]
})


export class TournamentDetailEditorComponent implements OnInit {
  // the tournament and a copy thereof for editing.
  @Input() tournament: ExternalTournament;
  t:ExternalTournament = null;

  // When the user creates or updates a tournament, tell mom.
  @Output() change: EventEmitter<string> = new EventEmitter<string>();

  // various bits of state.
  disabled:boolean;
  tYear: string;
  private endFC: FormControl;
  private startFC: FormControl;


  // These are for populating drop-downs.  The supported values in each subsequent
  // drop down depends on the choices in the previous ones - so they keep changing.
  supportedSanctioningBodies: string[];
  supportedCategories: string[];
  supportedSubCategories: string[];

  // Kludge alert - this should be data driven from the ratingsService, but it ain't
  // All ATP, ITF and WTA tournaments *must* come through the ITF API. So we have to
  // disable those sanctioning body options in the manual creation of a tournament.
  noManualTournaments:string[] = ['ATP','ITF','WTA'];

  constructor(private tournamentService: ExternalTournamentService,
              private ratingService: RatingService,
  ){
    this.t = new ExternalTournament();
  }

  ngOnInit() {
  }

  // When the @input field changes (specifically when a new tournament is selected)
  // repopulate the form.
  ngOnChanges() {
    // make a copy of the event object for editing
    Object.assign(this.t, this.tournament);

    // Note: for some reason the propel framework does not properly
    // initialize the number of events to 0 in the database when a new
    // tournament is created.  Until such time, we make the small kludge
    // on the next line.
    if (this.tournament.numEvents == null) this.t.numEvents = 0;

    // 1) you can't edit a tournament if it was not manually created.  Why?
    // Because next time we download the tournament from the ITF API - poof changes gone.
    // 2) you cant edit a tournament if it has events. The subtlety on this point
    // is that if you were to change, for example, the category of the tournament
    // Then it is highly likely that the event gender and event type of the events
    // would no longer be valid for the new category of the tournament.
    // So for an obvious example, if you were to change the sanctioning body of some
    // tournament from WTA to ATP, what would you do about the fact that there
    // are a bunch of women's events in the tournament? So no change.
    this.disabled = !this.tournament.manuallyCreated || this.t.numEvents > 0;

    this.tYear = this.tournament.endDate.substr(0,4);
    this.startFC = new FormControl(moment(this.tournament.startDate.substr(0,10)))
    this.endFC = new FormControl(moment(this.tournament.endDate.substr(0,10)))
    this.onFormChange();
  }

  onEndDateChanged() {
    if (this.endFC.value < this.startFC.value) {
      this.startFC.setValue(this.endFC.value.subtract(1,'days'));
    }
    this.onFormChange();
  }

  onStartDateChanged() {
    if (this.endFC.value < this.startFC.value) {
      this.endFC.setValue(this.startFC.value.add(1,'days'));
    }
    this.onFormChange();
  }


  // When someone changes the form make sure the drop-downs are properly adjusted.
  // For example, when the sanctioning body changes from ATP to WTA, then the
  // options available in the category menu change significantly.
  onFormChange() {
    // If the end date changes, and therefore the year of the tournament
    // changes, then we have to consult the rating service to see what
    // sanctioning bodies are supported in the chosen year.
    this.tYear = this.endFC.value.format("YYYY");

    // Check that the currently chosen sanctioning body is supported in the
    // tournament year and if not, try to set it intelligently or unset it.
    this.supportedSanctioningBodies = this.ratingService.getSanctioningBodies(this.tYear);
    if (!this.supportedSanctioningBodies.includes(this.t.sanctioningBody)) {
      if (this.supportedSanctioningBodies.includes(this.tournament.sanctioningBody)) {
        this.t.sanctioningBody = this.tournament.sanctioningBody;
      } else {
        this.t.sanctioningBody = null;
      }
    }

    // Check that the currently chosen category is supported by the sanctioning
    // body of the tournament and if not try to set it intelligently or unset it.
    this.supportedCategories = this.ratingService.getCategories(
      this.tYear, this.t.sanctioningBody);
    if (!this.supportedCategories.includes(this.t.category)) {
      if (this.supportedCategories.includes(this.tournament.category)) {
        this.t.category = this.tournament.category;
      } else {
        this.t.category = null;
      }
    }

    // same story for subcategories
    this.supportedSubCategories = this.ratingService.getSubCategories(
      this.tYear, this.t.sanctioningBody, this.t.category);
    if (!this.supportedSubCategories.includes(this.t.subCategory)) {
      if (this.supportedSubCategories.includes(this.tournament.subCategory)) {
        this.t.subCategory = this.tournament.subCategory;
      } else if (this.supportedSubCategories.length == 1) {
        this.t.subCategory = this.supportedSubCategories[0];
      } else {
        this.t.subCategory = null;
      }
    }
  }

  // User wants to save changes
  onSave() {
    // we have to re-build the tournament using the form values in order to send
    // it to the server.
    this.tournament.name = this.t.name;
    this.tournament.sanctioningBody = this.t.sanctioningBody;
    this.tournament.category = this.t.category;
    this.tournament.subCategory = this.t.subCategory;
    this.tournament.startDate = this.startFC.value.format("YYYY-MM-DD");
    this.tournament.endDate = this.endFC.value.format("YYYY-MM-DD");
    if (this.tournament.tournamentId === "") {
      this.tournamentService.addTournament(this.tournament).subscribe( (t) => {
          // update the tournament Id from the returned data.
          this.tournament.tournamentId = t.tournamentId;
          this.t.tournamentId = t.tournamentId;
          this.change.emit("Added");
        }
      );
    } else {
      this.tournamentService.updateTournament(this.tournament).subscribe( data => {
          this.change.emit("Updated");
        }
      );
    }
  }
}
