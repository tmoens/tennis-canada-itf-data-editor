/**
 * This allows users to browse results of Canadians playing in international
 * tournaments such as ITF, WTA and ATP.
 */
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';

import { ExternalTournamentService } from '../ExternalTournament.service';
import { ResultFilter } from './ResultFilter';
import { TC_DATE_FORMATS } from '../dateFormats';

@Component({
  selector: 'app-results-browser',
  templateUrl: './results-browser.component.html',
  styleUrls: ['./results-browser.component.scss'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: TC_DATE_FORMATS},
  ]
})
export class ResultsBrowserComponent implements OnInit {
  // columns in the tournament table
  displayColumns = ['startDate', 'promoName', 'tournamentType',
    'eventType', 'fullName', 'id', 'vrid', 'fp', 'drawSize', 'jrPts', 'sbPts'];

  // The filtered set results
  results$: Observable<ResultDetail[]>;
  private filter: ResultFilter;
  private search$ = new Subject<object>();

  private initialResults: ResultDetail[] = [];
  private results: MatTableDataSource<ResultDetail>;
  private loadingResults:boolean = false;
  private resultCount:number = -1;

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
    private dataService: ExternalTournamentService)
  {
    this.results = new MatTableDataSource(this.initialResults);
    this.endFilterPeriodFC = new FormControl(moment());
    this.startFilterPeriodFC = new FormControl(moment().subtract(1,'months'));
    this.selectedSanctioningBody = this.sanctioningBodies[0];
    this.selectedSortOrder = this.sortOrders[0];
    this.filter = new ResultFilter();
  };

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

  // someone wants to focus on a single player
  onVRIDSelected(vrid:string) {
    this.filter.VRID = vrid;
    this.filter.playerId = null;
    this.filter.familyName = null;
    this.filter.tournamentName = null;
    this.search();
  }
  onPlayerIDSelected(playerId:string) {
    this.filter.VRID = null;
    this.filter.playerId = playerId;
    this.filter.familyName = null;
    this.filter.tournamentName = null;
    this.search();
  }
  onTournamentNameSelected(tournamentName:string) {
    this.filter.VRID = null;
    this.filter.playerId = null;
    this.filter.familyName = null;
    this.filter.tournamentName = tournamentName;
    this.search();
  }

  ngOnInit() {
    this.results$ = this.search$
      .switchMap((filter:ResultFilter) => this.dataService.getFilteredResults(filter))
      .catch(error => {
        // TODO: add real error handling
        console.log(error);
        return Observable.of<ResultDetail[]>([]);
      });

    this.results$.subscribe(data => {
      this.loadingResults = false;
      this.results.data = data;
      this.resultCount = this.results.data.length;
      this.results.data.map((r) => {
        r.fullName = r.familyName + ", " + r.givenName;
        r.eventDescription = [r.gender, r.eventType, r.discipline.substr(0,1)].join(" ");
        r.isJunior = ((parseInt(r.endDate.substr(0,4)) - r.YOB) < 19);
        if (r.ignoreResults == "1") {
          r.eventDescription = r.eventDescription + "(q)";
        }
        if (r.ignoreResults == "1" || !r.isJunior) {
          r.tcJrPoints = "N/A";
        } else {
          if (r.rating == null) {
            r.tcJrPoints = "unrated";
          } else {
            r.tcJrPoints = (
              Math.round(r.rating * 10000 *
              Math.pow(.6,Math.log2(r.finishPosition)))).toLocaleString();
          }
        }
      });
    });
  }

  search() {
    this.loadingResults = true;
    this.filter.end = this.endFilterPeriodFC.value.format("YYYY-MM-DD");
    this.filter.start = this.startFilterPeriodFC.value.format("YYYY-MM-DD");
    this.filter.sanctioningBody = this.selectedSanctioningBody.value;
    this.filter.sortOrder = this.selectedSortOrder.value;
    this.search$.next(this.filter)
  }
}

// an event result with a bit of player information
export class ResultDetail {
  eventId: string;
  playerId: string;
  finishPosition: number;
  externalRankingPoints: string;
  manualPointAllocation: string;
  VRID: string;
  givenName: string;
  familyName: string;
  YOB:number;
  promoName: string;
  hostNation: string;
  sanctioningBody: string;
  category: string;
  subCategory: string;
  startDate: string;
  endDate: string;
  gender: string;
  eventType: string;
  discipline: string;
  rating:number;
  drawSize: number;
  ignoreResults: string;
  fullName:string;
  eventDescription:string;
  tcJrPoints:string;
  isJunior:boolean;
}
