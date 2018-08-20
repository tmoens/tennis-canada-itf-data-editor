import { Component, OnInit , Input , Output, OnChanges, EventEmitter } from '@angular/core';

import { ExternalTournament } from '../ExternalTournament';
import { ExternalEvent } from '../ExternalEvent';
import { RatingService } from '../rating-service.service';
import { ExternalTournamentService } from '../ExternalTournament.service';

@Component({
  selector: 'app-event-detail-editor',
  templateUrl: './event-detail-editor.component.html',
  styleUrls: ['./event-detail-editor.component.css']
})
export class EventDetailEditorComponent implements OnInit {
  @Input() tournament: ExternalTournament;
  @Input() event: ExternalEvent;
  @Output() change: EventEmitter<string> = new EventEmitter<string>();
  tYear: string;

  // this holds event data as the user is editing it.
  e:ExternalEvent = null;

  // These are for poulating dropdowns
  supportedGenders: string[];
  supportedEventTypes: string[];

  constructor(private tournamentService: ExternalTournamentService,
              private ratingService: RatingService,
  ) {
    this.e = new ExternalEvent();
  }

  ngOnInit() {
  }

  // When the @input data changes
  // specifically if the tournament data changes, we need to re-calculate the
  // supported genders and event types.
  // Actually we just use use a sledge hammer here and recalculate whenever
  // any input changes.
  ngOnChanges() {
    // make a copy of the event object for editing
    Object.assign(this.e, this.event);
    this.tYear = this.tournament.endDate.substr(0,4);
    this.supportedGenders = this.ratingService.getEventGenders(
      this.tYear, this.tournament.sanctioningBody,
      this.tournament.category, this.tournament.subCategory);
    this.supportedEventTypes = this.ratingService.getEventTypes(
      this.tYear, this.tournament.sanctioningBody,
      this.tournament.category, this.tournament.subCategory);
    if (this.supportedGenders.length == 1) this.e.gender = this.supportedGenders[0];
    if (this.supportedEventTypes.length ==1) this.e.eventType = this.supportedEventTypes[0];
    if (this.e.discipline == null) this.e.discipline = "Singles";
    this.onFormChange();
  }

  onFormChange() {
    // lookup the rating.
    let rating = this.ratingService.getRating(this.tYear, this.tournament.sanctioningBody, this.tournament.category,
      this.tournament.subCategory, this.e.gender, this.e.eventType);
    if (rating) {
      this.e.rating = rating.eventRating * rating.sanctioningBodyRating;
      this.e.ratingId= rating.ratingId;
    } else {
      this.e.rating = 0;
      this.e.ratingId= null;
    }
  }

  // User wants to save changes
  onSave() {
    // we have to re-build the event using the form values in order to send
    // it to the server.
    Object.assign(this.event, this.e);
    if (this.event.eventId === "") {
      this.tournamentService.addEvent(this.event).subscribe( (e) => {
        // update the tourament Id from the returned data.
        this.event.eventId = e.eventId;
        this.e.eventId = e.eventId;
        this.change.emit("Added");
        }
      );
    } else {
      this.tournamentService.updateEvent(this.event).subscribe( _ => {
          this.change.emit("Updated");
        }
      );
    }
  }
}
