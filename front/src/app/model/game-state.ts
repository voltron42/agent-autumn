export class GameState {
  sessionID?:string;
  isHost?:boolean;
  playerName?:string;
  joining?:boolean;
  haveAllJoined?:boolean;
  endTime?:number;
  role?:string;
  location?:string;
  players?:string[];
  locations?:string[];
  activePlayers?:boolean[];
  activeLocations?:boolean[];
  vote?:string;
  guess?:string;
  result?:string;
  spy?:string;

  public reset() {
    delete this.sessionID;
    delete this.isHost;
    delete this.playerName;
    delete this.haveAllJoined;
    delete this.endTime;
    delete this.role;
    delete this.location;
    delete this.players;
    delete this.locations;
    delete this.activePlayers;
    delete this.activeLocations;
    delete this.vote;
    delete this.guess;
    delete this.result;
    delete this.spy;
  }

  join(args: {
    sessionID:string,
    playerName:string
  }) {
    this.sessionID = args.sessionID;
    this.playerName = args.playerName;
  }
}
