import {GameState} from "./game-state";

export class Result {
  result: string;
  spy?: string;
  location?: string;

  applyTo(state: GameState) {
    if (this.spy || this.location) {
      state.result = this.result;
      state.spy = this.spy;
      state.location = this.location;
    }
  }
}
