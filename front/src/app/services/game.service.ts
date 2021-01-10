import { Injectable } from '@angular/core';
import {NewGameReq} from "../model/new-game-req";
import {Observable} from "rxjs";
import {NewGameResp} from "../model/new-game-resp";
import {HttpClient} from "@angular/common/http";
import {JoinResp} from "../model/join-resp";
import {AllJoinedResp} from "../model/all-joined-resp";
import {GameState} from "../model/game-state";
import {StartClockResp} from "../model/start-clock-resp";
import {ReadyResp} from "../model/ready-resp";
import {VoteResp} from "../model/vote-resp";
import {GuessResp} from "../model/guess-resp";
import {Result} from "../model/result";
import {CloseResp} from "../model/close-resp";
import {JoinedResp} from "../model/joined-resp";

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private hc: HttpClient) { }

  public hostNewGame(request: NewGameReq): Observable<NewGameResp> {
    return this.hc.post<NewGameResp>("/host",request);
  }

  public joinGame(state:GameState): Observable<JoinResp> {
    return this.hc.post<JoinResp>("/game/"+state.sessionID+"/join",{playerName:state.playerName});
  }

  public hasJoined(state:GameState):Observable<JoinedResp>{
    return this.hc.get<JoinedResp>("/game/"+state.sessionID+"/has-joined");
  }

  public haveAllJoined(state:GameState):Observable<AllJoinedResp>{
    return this.hc.get<AllJoinedResp>("/game/"+state.sessionID+"/all-joined");
  }

  public startClock(state:GameState):Observable<StartClockResp>{
    return this.hc.post<StartClockResp>("/game/"+state.sessionID+"/start-clock",{});
  }

  public getReadyState(state:GameState):Observable<ReadyResp> {
    return this.hc.get<ReadyResp>("/game/"+state.sessionID+"/ready");
  }

  public submitVote(state:GameState):Observable<VoteResp> {
    return this.hc.post<VoteResp>("/game/"+state.sessionID+"/vote",{targetName:state.vote});
  }

  public submitGuess(state:GameState):Observable<GuessResp> {
    return this.hc.post<GuessResp>("/game/"+state.sessionID+"/guess",{location:state.guess});
  }

  public getResult(state:GameState):Observable<Result>{
    return this.hc.get<Result>("/game/"+state.sessionID+"/result");
  }

  public closeSession(state:GameState):Observable<CloseResp> {
    return this.hc.delete<CloseResp>("/game/"+state.sessionID+"/close");
  }
}
