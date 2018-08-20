/**
 * When the ITF Data loader loads WTA, ATP and ITF tournaments from the
 * ITF API, sometimes there is insufficient information to completely
 * categorize the tournament for the purpose of awarding Tennis Canada
 * ranking points for results in the tournament.
 *
 * This component allows the user to complete the categorization.
 *
 * In fact, the user simply needs to choose the sub-category for
 * things like ATP Futures or WTA Challenge Series or ITF Grade A
 * tournaments.  That is all.
 */
import { Component, OnInit  } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';

import { ExternalTournament } from '../ExternalTournament';
import { RatingService } from '../rating-service.service';
import { ExternalTournamentService } from '../ExternalTournament.service';
import { TournamentFilter } from './TournamentFilter';
import { TC_DATE_FORMATS } from '../dateFormats';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-tournament-rater',
  templateUrl: './tournament-rater.component.html',
  styleUrls: ['./tournament-rater.component.scss'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: TC_DATE_FORMATS},
  ]
})

export class TournamentRaterComponent implements OnInit {
  // columns in the tournament table
  displayColumns = ['name', 'hn', 'sb', 'ed', 'category', 'subCategory', 'updated'];

  // The list of tournaments that need classification by the user
  tournaments: ExternalTournament[];
  // Corresponding array of which tournaments the user has rated
  rated: boolean[];
  // Corresponding array of the subcategories supported for each
  // tournament (because the subcategories differ between
  // sanctioning bodies and categories within sanctioning bodies)
  // For example, several sub categories exist for ATP Futures.
  supportedSubCategories: string[][];

  // For filtering the list of tournaments
  private filter: TournamentFilter;

  // FOr presenting the tournaments in a material table
  ut: MatTableDataSource<ExternalTournament>;

  // Progress indicators
  todoCount: number;
  loadingTournaments:boolean;

  private endFilterPeriodFC: FormControl;
  private startFilterPeriodFC: FormControl;

  private sanctioningBodies = [
    {name: 'Any', value: null},
    {name: 'ITF', value: 'ITF'},
    {name: 'ATP', value: 'ATP'},
    {name: 'WTA', value: 'WTA'},
    {name: 'TE', value: 'TE'},
    {name: 'USTA', value: 'USTA'},
  ];

  private sortOrders = [
    {name: 'Name/Date', value: 1},
    {name: 'Date/Tournament/Name', value: 2},
  ];

  private selectedSanctioningBody;
  private selectedSortOrder;

  constructor(
    private tournamentService: ExternalTournamentService,
    private ratingService: RatingService,
  ) {
    this.tournaments = [];
    this.ut = new MatTableDataSource(this.tournaments);
    this.supportedSubCategories = [];
    this.rated = [];
    this.filter = new TournamentFilter();
    this.todoCount = 0;
    this.endFilterPeriodFC = new FormControl(moment());
    this.startFilterPeriodFC = new FormControl(moment().subtract(12,'months'));
    this.selectedSanctioningBody = this.sanctioningBodies[0];
    this.selectedSortOrder = this.sortOrders[0];
  }

  onEndDateChanged() {
    if (this.endFilterPeriodFC.value < this.startFilterPeriodFC.value) {
      this.startFilterPeriodFC.setValue(this.endFilterPeriodFC.value.subtract(1,'days'));
    }
  }

  onStartDateChanged() {
    if (this.endFilterPeriodFC.value < this.startFilterPeriodFC.value) {
      this.endFilterPeriodFC.setValue(this.startFilterPeriodFC.value.add(1,'days'));
    }
  }

  ngOnInit() {
    this.loadTournaments();
  }

  loadTournaments() {
    this.loadingTournaments = true;
    this.tournamentService.getFilteredTournaments(this.filter)
        .subscribe(data => this.tournamentsArrived(data));
  }

  tournamentsArrived(data) {
    this.tournaments = data;
    this.ut = new MatTableDataSource(this.tournaments);
    this.supportedSubCategories = [];
    this.rated = [];
    this.todoCount = 0;
    for (let i = 0; i < this.tournaments.length; i++) {
      let t = this.tournaments[i];
      if (t.subCategory == null) this.todoCount++;
      t.subCategoryEditable = t.category == "WITF" || t.category == "Futures"
        || t.category == "Challenger" || t.category == "Grade A";
      this.rated[t.tournamentId] = false;
      this.supportedSubCategories[t.tournamentId] =
        this.ratingService.getSubCategories(
          t.startDate.substr(0,4),
          t.sanctioningBody,
          t.category);
    }
    this.loadingTournaments = false;
  }

  // The user has selected a category for the tournament
  onCategorize(t: ExternalTournament) {
    this.tournamentService.categorizeTournament(
      t.tournamentId,
      t.subCategory
    ).subscribe((data) => {
      this.rated[t.tournamentId] = true;
      this.todoCount--;
    });
  }


  search() {
    this.filter.endPeriod = this.endFilterPeriodFC.value.format("YYYY-MM-DD");
    this.filter.startPeriod = this.startFilterPeriodFC.value.format("YYYY-MM-DD");
    this.filter.sanctioningBody = this.selectedSanctioningBody.value;
    this.filter.sortOrder = this.selectedSortOrder.value;
    this.loadTournaments();
  }

  // I know I know, this belongs in the External Tournament object and not here.
  makeURL(t:ExternalTournament):string {
    let url = "http://www.google.ca";
    switch (t.sanctioningBody) {
      case "ATP":
        switch(t.category) {
          case "Futures":
            url = "http://www.itftennis.com/procircuit/tournaments/men's-calendar.aspx?" +
              "nat=" + t.hostNation +
              "&fromDate=" + t.startDate.substr(0,10) +
              "&toDate=" + t.endDate.substr(0,10);
            break;
          case "Challenger":
            url = "http://www.atpworldtour.com/en/scores/results-archive?year=" +
            t.endDate.substr(0,4) + "&tournamentType=ch";
            break;
          default:
            url = "http://www.atpworldtour.com/en/tournaments";
            break;
        }
        break;
      case "WTA":
        switch(t.category) {
          case "WITF":
            url = "http://www.itftennis.com/procircuit/tournaments/women's-calendar.aspx?" +
              "nat=" + t.hostNation +
              "&fromDate=" + t.startDate.substr(0,10) +
              "&toDate=" + t.endDate.substr(0,10);
            break;
          default:
            url = "http://www.wtatennis.com/tournaments";
            break;
        }
        break;
      case "ITF":
        url = "http://www.itftennis.com/juniors/tournaments/calendar.aspx?" +
          "nat=" + t.hostNation +
          "&fromDate=" + t.startDate.substr(0,10) +
          "&toDate=" + t.endDate.substr(0,10);
        break;
    }
    return url;
  }

  }
