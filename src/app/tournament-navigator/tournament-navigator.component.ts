/**
 * Present a list of non Tennis Canada tournaments for which
 * Tennis Canada tracks results.  These tournaments are tracked for the purposes
 * of rankings as well as statistical analysis.
 */
import { Component, OnInit } from '@angular/core';

import { ExternalTournament } from '../ExternalTournament';
import { ExternalEvent } from '../ExternalEvent';
import { ExternalTournamentService } from '../ExternalTournament.service';

import { Observable }        from 'rxjs/Observable';
import { BehaviorSubject }   from 'rxjs/BehaviorSubject';

// Observable class extensions
import 'rxjs/add/observable/of';
// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/find';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/count';

@Component({
  selector: 'app-tournament-navigator',
  templateUrl: './tournament-navigator.component.html',
  styleUrls: ['./tournament-navigator.component.scss']
})
export class TournamentNavigatorComponent implements OnInit {
  // For filtering the tournament list to a manageable subset
  filterString: string = "";

  // if the user is creating a new tournament or event.
  newTournament: ExternalTournament = null;
  newEvent: ExternalEvent = null;

  // for showing progress
  tournamentsLoading = false;
  eventsLoading = false;

  // The filtered set of External Tournaments the user is looking at
  // I could not figure how to be able to look at the count() of the observable
  // probably because tournaments->count() itself returns an Observable.
  tournaments$: Observable<ExternalTournament[]>;
  tournamentCount: number;

  // The Tournament the user has selected for editing
  // The details of this tournament are presented in the Tournament Detail component
  selectedTournament: ExternalTournament = null;

  // The list of events for the selected tournament
  events$:Observable<ExternalEvent[]>;
  // the selected event
  selectedEvent: ExternalEvent = null;

  // A stream used to trigger the refresh of the tournaments$ Observable.
  // Note if it is a Subject (as per the Angular demo) and not a BehaviorSubject,
  // Then the initial http response from the server does not make it to the GUI
  private tournamentLoadTrigger:BehaviorSubject<string> = new BehaviorSubject("nothing");

  constructor(
    private tournamentService: ExternalTournamentService,
  ) {
    this.filterString = "";
  }

  ngOnInit() {
    // This is where the work gets done to keep the ITF Tournament List
    // up to date whenever the search filter changes.
    // Ideally I think the filter terms should be in the BehaviorSubject
    // but I am just pulling them from local variables.
    this.tournaments$ = this.tournamentLoadTrigger
      .debounceTime(100)        // wait 100ms after each keystroke before considering the term
      .switchMap(() => this.tournamentService.getManualTournaments(this.filterString))
      .catch(error => {
        // if this goes wrong, it is a programming error and
        // there is nothing the user can really do.
        return Observable.of<ExternalTournament[]>([]);
      });

    this.tournamentLoadTrigger.subscribe(_ => this.tournamentsLoading = true);

    // Watch for the arrival of the ITF Tournaments from the Server
    this.tournaments$.subscribe(tournaments => {
      this.onTournamentsArrived(tournaments);
    });

    // Do an initial search.
    this.loadTournaments();
  }

  // When the user changes the filter
  onFilterChange():void {
    this.loadTournaments();
  }

  loadTournaments(): void {
    // cancel the creation of a new tournament and/or event
    if (this.selectedTournament == this.newTournament) {
      this.selectedTournament = null;
      this.newTournament = null;
    }
    if (this.selectedEvent == this.newEvent) {
      this.selectedEvent = null;
      this.newEvent = null;
    }
    this.tournamentLoadTrigger.next("nothing");
  }

  onTournamentsArrived(tournaments):void {
    this.tournamentsLoading = false;
    this.tournamentCount = tournaments.length;
    // If there had been a tournament selected before the load, try to reselect it.
    // Otherwise select the first tournament in the list.
    if (tournaments.length == 0) {
      this.selectedTournament = null;
    } else {
      let found = false;
      if (this.selectedTournament) {
        for (let i = 0; i < tournaments.length; i++) {
          if (this.selectedTournament.tournamentId == tournaments[i].tournamentId) {
            found = true;
            this.selectTournament(tournaments[i]);
            break;
          }
        }
      }
      if (!found) {
        this.selectTournament(tournaments[0]);
      }

    }
  }

  // Trigger the loading of events for the selected tournament
  loadEvents(): void {
    this.eventsLoading = true;
    this.events$ = this.tournamentService.getTournamentEvents(this.selectedTournament.tournamentId);
    this.events$.subscribe(data => {
      this.onEventsArrived(data);
    });
  }

  onEventsArrived(events):void {
    this.eventsLoading = false;
    // If there was an event selected prior to the load, try to reselect it.
    if (events.length == 0) {
      this.selectEvent(null);
    } else {
      let found = false;
      if (this.selectedEvent) {
        for (let i = 0; i < events.length; i++) {
          if (this.selectedEvent.eventId == events[i].eventId) {
            found = true;
            this.selectEvent(events[i]);
            break;
          }
        }
      }
      if (!found) {
        this.selectEvent(null);
      }
    }
  }

  // When a tournament is selected, place it in a local variable.
  // Load the events for that tournament
  selectTournament(tournament: ExternalTournament): void {
    // if there is a newTournament or newEvent, remove it - it is no longer in play.
    this.selectedTournament = tournament;
    this.loadEvents();
  }

  // When the user selects a tournament, do some housekeeping
  // then do the select the tournament.
  onUserSelectTournament(tournament: ExternalTournament):void {
    // If there is a newTournament or newEvent, remove it
    this.newTournament = null;
    this.newEvent = null;
    // If there was a selected event, unselect it,
    // the user is focusing on a tournament now
    this.selectEvent(null);
    this.selectTournament(tournament);
  }

  // When an event is selected, place it in a local variable.
  // This triggers the Event Detail component to refresh.
  selectEvent(event: ExternalEvent): void {
    // if there is a newEvent, remove it - it is no longer in play.
    if (this.selectedEvent != event) {
      this.selectedEvent = event;
    }
  }

  // When the user selects an event, do some housekeeping
  // then do the select the event.
  onUserSelectEvent(event: ExternalEvent): void {
    // if there is a newEvent, remove it - it is no longer in play.
    this.newEvent = null;
    this.selectEvent(event);
  }

  onNewTournament() {
    this.newTournament =  new ExternalTournament();
    this.newTournament.tournamentId = '';
    this.newTournament.name = '';
    this.newTournament.startDate = new Date().toISOString().substr(0,10);
    this.newTournament.endDate = new Date().toISOString().substr(0,10);
    this.newTournament.manuallyCreated = true;
    this.newTournament.category = null;
    this.newTournament.subCategory = null;
    this.newTournament.sanctioningBody = null;
    this.selectTournament(this.newTournament);
  }

  onNewEvent(event) {
    event.stopPropagation();
    this.newEvent =  new ExternalEvent();
    this.newEvent.eventId = '';
    this.newEvent.tournamentId = this.selectedTournament.tournamentId;
    this.newEvent.name = '';
    this.newEvent.gender = null;
    this.newEvent.manuallyCreated = true;
    this.newEvent.eventType = null;
    this.newEvent.discipline = null;
    this.newEvent.ratingId = null;
    this.newEvent.rating = 0;
    this.newEvent.ignoreResults = false;
    this.newEvent.numResults = 0;
    this.selectEvent(this.newEvent);
  }

// User wants to delete the tournament
// todo handle the error
  onDeleteTournament(id) {
    this.tournamentService.deleteTournament(id).subscribe((data) => {
      this.selectedTournament = null;
      // re-load the tournaments, the deleted one will disappears.
      // Note, one cannot remove the tournament from the Observable tournaments$
      // as a shortcut.
      this.loadTournaments();
    });
  }

  onDeleteEvent(id) {
    this.tournamentService.deleteEvent(id).subscribe((data) => {
      this.selectedEvent = null;
      // re-load the tournaments as the containg tournament may have changed
      // for example, it may now be deleteable.
      this.loadTournaments();
    });
  }

  onTournamentUpdated(updateEvent) {
    switch (updateEvent) {
      case 'Added':
        this.newTournament = null;
        this.loadTournaments();
        break;
      case 'Updated':
        // After updating - reload the tournament list as it may have changes
        // For example, the tournament may not event be on the filtered list anymore
        this.loadTournaments();
        break;
      default:
        //  this is an error - no other events are emitted
        break;
    }
  }

  onEventUpdated(updateEvent) {
    switch (updateEvent) {
      case 'Added':
        this.newEvent = null;
        // After updating - reload the tournament list as it may have changes
        // For example, the may tournament containing the event will no longer be deleteable
        this.loadTournaments();
        break;
      case 'Updated':
        // cannot really think why this is necessary, but...
        this.loadTournaments();
        break;
      default:
        //  this is an error - no other events are emitted
        break;
    }
  }
}
