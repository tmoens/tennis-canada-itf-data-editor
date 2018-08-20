/**
 * Ted Moens
 * 2017-12-10
 * Tennis Canada rates external (non Tennis Canada) tournaments so their results can be used
 * Tennis Canada rankings.
 * This service loads all of the possible ratings and then answers whatever questions
 * other modules might have about the ratings.  Such as
 *
 * In 2017, what rating was given to ITF Junior Boys Grade 5 level tournaemnts.
 * In 2018, what rating was given to ATP Futures $25,000 tournaments.
 * In 2015, what types of ITF tournaments did Tennis Canada have ratings for.
 *
 * The data is intended to be loaded one time as it could easily be called a lot by clients
 * and we don't want to make round-trips to the server for every call.
 *
 * This also means that it needs to be loaded by the application itself before the
 * various components can start asking questions of it.
 */
import { Injectable  } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import 'rxjs/add/operator/map';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class RatingService {
  private ratings: RatingLevel;

  constructor(private http: HttpClient) {
    this.ratings = new RatingLevel('root');
  }

  // ratings are publicly available and do not need autorization header.
  loadRatings():void {
    let url = 'http://localhost/TCStatsServer2/public/api/v1/RR/Ratings/GetAllEventRatings';
    this.http
      .get<any>(url, httpOptions)
      .subscribe(data => {
        this.processRatings(data.EventRatings);
      });
  };

  getSanctioningBodies(year: string): string[]{
    if (year === null) return [];
    return this.ratings.getSubLevel(year)
      .getSubLevelNames();
  }

  getCategories(year: string, sanctioningBody:string): string[]{
    if (year === null || sanctioningBody === null ) return [];
    return this.ratings.getSubLevel(year)
      .getSubLevel(sanctioningBody)
      .getSubLevelNames();
  }

  getSubCategories(year: string, sanctioningBody:string, category: string):string[]{
    if (year === null || sanctioningBody === null || category === null ) return [];
    return this.ratings.getSubLevel(year)
      .getSubLevel(sanctioningBody)
      .getSubLevel(category)
      .getSubLevelNames();
  }

  getEventGenders(year: string, sanctioningBody:string, category: string,
                  subCategory: string):string[]{
    if (year === null || sanctioningBody === null || category === null || subCategory === null ) return [];
    return this.ratings.getSubLevel(year)
      .getSubLevel(sanctioningBody)
      .getSubLevel(category)
      .getSubLevel(subCategory)
      .getSubLevelNames();
  }

  // Get the suported event types regardless of gender
  getEventTypes(year: string, sanctioningBody:string, category: string,
                subCategory: string):string[]{
    if (year === null || sanctioningBody === null || category === null || subCategory === null ) return [];
    let genders = this.getEventGenders(year, sanctioningBody, category, subCategory);
    let eventTypes = [];
    if (genders.includes('M')) {
      eventTypes = this.ratings.getSubLevel(year)
        .getSubLevel(sanctioningBody)
        .getSubLevel(category)
        .getSubLevel(subCategory)
        .getSubLevel('M')
        .getSubLevelNames();
    }
    if (genders.includes('F')) {
      let fEventTypes = this.ratings.getSubLevel(year)
        .getSubLevel(sanctioningBody)
        .getSubLevel(category)
        .getSubLevel(subCategory)
        .getSubLevel('F')
        .getSubLevelNames();
      for (let i = 0; i < fEventTypes.length; i++){
        if (!eventTypes.includes(fEventTypes[i])) eventTypes.push(fEventTypes[i]);
      }
    }
    return eventTypes.sort();
  }

  getRating(year: string, sanctioningBody:string, category: string,
            subCategory: string, eventGender: string, eventType: string):EventRating{
    if (year === null || sanctioningBody === null || category === null || subCategory === null ||
      eventGender === null || eventType === null  ) {
      // let er = new EventRating();
      // er.sanctioningBodyRating = 0;
      // er.eventRating = 0;
      // er.ratingId = null;
      // return er;
      return null;
    } else {
      return this.ratings.getSubLevel(year)
        .getSubLevel(sanctioningBody)
        .getSubLevel(category)
        .getSubLevel(subCategory)
        .getSubLevel(eventGender)
        .getSubLevel(eventType)
        .getEventRating();
    }
  }

  // The ratings come in as jason data.  Each row has one rating
  // potentially many levels deep.

  processRatings(rawRatings: EventRating[]) {
    for (let i in rawRatings) {
      let r = rawRatings[i];
      let yearRatingLevel = this.ratings.getOrCreateSubLevel(r.year, 1);
      let sanctioningBodyLevel = yearRatingLevel.getOrCreateSubLevel(r.sanctioningBody,r.sanctioningBodyRating);
      let categoryLevel = sanctioningBodyLevel.getOrCreateSubLevel(r.category,1);
      let subCategoryLevel = categoryLevel.getOrCreateSubLevel(r.subCategory, 1);
      let genderLevel = subCategoryLevel.getOrCreateSubLevel(r.eventGender, 1);
      let eventTypeLevel = genderLevel.getOrCreateSubLevel(r.eventType, 1);
      eventTypeLevel.setEventRating(r);
    }
  };

}

/**
 * Created by Ted on 2017-11-13.
 */
// We have several levels of rating
// The "year" Level allows for ratings to change year over year
// The Sanction body level includes ATP, WTA, ITF, etc
// the ITF level has Grades A, B, 1, 2, 3, 4, and 5.
// Grade ITF A has grand slams, A1 and A2.
// Grade ITF A1 has male and female ratings
// So each Level has a number of ratings
// And each Rating can have a number of sublevels until you hit bottom.

export class RatingLevel {
  name: string;
  rating: number;
  subLevels: RatingLevel[];
  eventRating: EventRating;

  constructor(name: string, rating: number = 1) {
    this.name = name;
    this.rating = rating;
    this.subLevels = [];
    this.eventRating = null;
  }

  getOrCreateSubLevel(name: string, rating: number = 1): RatingLevel {
    if (name in this.subLevels) {
      return this.subLevels[name];
    } else {
      let newRating = new RatingLevel(name, rating);
      this.subLevels[name] = newRating;
      return newRating;
    }
  }

  getSubLevel(name: string): RatingLevel {
    return this.subLevels[name];
  }

  setEventRating(rating: EventRating): void {
    this.eventRating = rating;
  }

  getEventRating(): EventRating {
    return this.eventRating;
  }

  // for building a data entry form for a tournament
  getSubLevelNames() {
    return Object.keys(this.subLevels).sort();
  }
}

export class EventRating {
  ratingId: number;
  year: string;
  sanctioningBody: string;
  category: string;
  subCategory: string;
  eventGender: string;
  eventType: string;
  eventRating: number;
  sanctioningBodyRating: number;
}
