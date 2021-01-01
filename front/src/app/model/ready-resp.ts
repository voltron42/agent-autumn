import {GameState} from "./game-state";

export class ReadyResp {
  endTime:number;
  role:string;
  location?:string;
  players:string[];
  locations:string[];

  applyTo(state: GameState) {
    state.endTime = this.endTime;
    state.role = this.role;
    state.location = this.location;
    state.players = this.players;
    state.activePlayers = Array.from<boolean>("?".repeat(this.players.length).split("").map(()=>true));
    state.locations = this.locations;
    state.activeLocations = Array.from<boolean>("?".repeat(this.locations.length).split("").map(()=>true));
  }
}
