// A custom filter for results from international tournament results.
export class TournamentFilter {
  uncategorizedOnly:boolean = true;
  tournamentName: string = null;
  sanctioningBody: string = null;
  category: string = null; // not used yet
  startPeriod:string;
  endPeriod:string;
  sortOrder:number; // not used yet
}
