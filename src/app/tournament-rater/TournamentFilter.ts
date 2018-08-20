// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as moment from 'moment';


export class ResultFilter {
  playerId: string = null;
  VRID: string = null;
  familyName: string = null;
  tournamentName: string = null;
  sanctioningBody: string = null;
  category: string = null;
  subCategory: string = null;
  start:string;
  end:string;
  sortOrder:number;
}
