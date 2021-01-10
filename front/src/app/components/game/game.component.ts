import { Component, OnInit } from '@angular/core';
import {GameService} from "../../services/game.service";
import {GameState} from "../../model/game-state";
import {FormBuilder, FormGroup} from "@angular/forms";
import {NewGameResp} from "../../model/new-game-resp";
import {NewGameReq} from "../../model/new-game-req";
import {GAME_DATA} from "../../const/game-data";
import {HttpErrorResponse} from "@angular/common/http";
import {AllJoinedResp} from "../../model/all-joined-resp";
import {JoinResp} from "../../model/join-resp";
import {JoinedResp} from "../../model/joined-resp";
import {ReadyResp} from "../../model/ready-resp";
import {StartClockResp} from "../../model/start-clock-resp";
import {Result} from "../../model/result";
import {GuessResp} from "../../model/guess-resp";
import {VoteResp} from "../../model/vote-resp";
import {CloseResp} from "../../model/close-resp";

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  public state: GameState = new GameState();

  public countdown: string = "";

  public hostForm: FormGroup = this.fb.group({
    playerName:[''],
    addlPlayerCount:[3],
    durationMinutes:[10]
  });

  public joinForm: FormGroup = this.fb.group({
    sessionID:[''],
    playerName:['']
  });

  constructor(private game: GameService, private fb: FormBuilder) { }

  private static showModal(id: string) {
    let elem: HTMLElement = document.getElementById(id);
    let modal: HTMLDialogElement = elem as HTMLDialogElement;
    modal.showModal();
  }

  private static closeModal(id:string) {
    let elem: HTMLElement = document.getElementById(id);
    let modal: HTMLDialogElement = elem as HTMLDialogElement;
    modal.close();
  }

  ngOnInit() {
  }

  host() {
    GameComponent.showModal("host-modal");
  }

  private static defaultRetries: number = 5;
  private static retryDelay: number = 1000;
  private static pollingDelay: number = 400;

  private buildErrorHandler(retryCodes:number[],retryCount:number,retryCall:()=>void):(error:HttpErrorResponse)=>void {
    return (error:HttpErrorResponse)=>{
      if (retryCodes.indexOf(error.status) >= 0) {
        if (retryCount > 0) {
          setTimeout(retryCall,GameComponent.retryDelay);
        }
      } else {
        if (this.state.sessionID) {
          this.game.closeSession(this.state);
        }
        this.state.reset();
      }
    }
  }

  confirmHost() {
    this.submitHostRequest(GameComponent.defaultRetries);
    GameComponent.showModal("host-modal");
  }

  private submitHostRequest(retryCount:number) {
    this.game.hostNewGame(new NewGameReq(this.hostForm.value,GAME_DATA)).subscribe((resp:NewGameResp)=>{
      this.state.sessionID = resp.sessionID;
      this.waitForAllJoined();
    },this.buildErrorHandler([404],retryCount,()=>{
      this.submitHostRequest(retryCount - 1);
    }));
  }

  private waitForAllJoined(retryCount:number=GameComponent.defaultRetries) {
    this.game.haveAllJoined(this.state).subscribe((resp:AllJoinedResp)=>{
      if (resp.allJoined) {
        this.state.haveAllJoined = true;
        if (!this.state.isHost) {
          this.waitForStart(GameComponent.defaultRetries);
        }
      } else {
        setTimeout(()=>{
          this.waitForAllJoined(retryCount);
        },GameComponent.pollingDelay);
      }
    },this.buildErrorHandler([404],retryCount,()=>{
      this.waitForAllJoined(retryCount - 1);
    }));
  }

  cancelHost() {
    GameComponent.closeModal("host-modal");
  }

  join() {
    GameComponent.showModal("join-modal");
  }

  confirmJoin() {
    this.state.joining = true;
    this.state.join(this.joinForm.value);
    this.submitJoinRequest(GameComponent.defaultRetries);
    GameComponent.closeModal("join-modal");
  }

  private submitJoinRequest(retryCount:number) {
    this.game.joinGame(this.state).subscribe((resp:JoinResp)=>{
      this.waitForHasJoined(GameComponent.defaultRetries);
    },this.buildErrorHandler([400,404],retryCount,()=>{
      this.waitForAllJoined(retryCount - 1);
    }));
  }

  private waitForHasJoined(retryCount:number) {
    this.game.hasJoined(this.state).subscribe((resp:JoinedResp)=>{
      if (resp.hasJoined) {
        this.waitForAllJoined(GameComponent.defaultRetries);
      } else {
        setTimeout(()=>{
          this.waitForHasJoined(retryCount);
        },GameComponent.pollingDelay);
      }
    },this.buildErrorHandler([404],retryCount,()=>{
      this.waitForHasJoined(retryCount - 1);
    }));
  }

  cancelJoin() {
    GameComponent.closeModal("join-modal");
  }

  cancelJoinWait() {
    this.state.reset();
  }

  startGame(retryCount:number=GameComponent.defaultRetries) {
    this.game.startClock(this.state).subscribe((resp:StartClockResp)=>{
      this.waitForStart(GameComponent.defaultRetries);
    },this.buildErrorHandler([404],retryCount,()=>{
      this.startGame(retryCount - 1);
    }));
  }

  private waitForStart(retryCount: number) {
    this.game.getReadyState(this.state).subscribe((resp:ReadyResp)=>{
      if (resp.endTime) {
        resp.applyTo(this.state);
        this.pollClock();
        this.waitForResult(GameComponent.defaultRetries);
      } else {
        setTimeout(()=>{
          this.waitForStart(retryCount);
        },GameComponent.pollingDelay);
      }
    },this.buildErrorHandler([404],retryCount,()=>{
      this.waitForStart(retryCount - 1);
    }));
  }

  private applyLeadingZeroes(count:number,value:number):string {
    return "?".repeat(count).split("").map((v,i)=>{
      return (Math.pow(10,count-i)>value?"0":"");
    }).join("") + value;
  }

  private pollClock() {
    let now = (new Date()).getTime();
    if (now < this.state.endTime) {
      let diff = Math.floor((this.state.endTime - now)/1000);
      this.countdown = [
        Math.floor(diff/60),
        diff % 60
      ].map((v)=>{
        return this.applyLeadingZeroes(1,v);
      }).join(":")
      setTimeout(()=>{
        this.pollClock();
      },GameComponent.pollingDelay);
    }
  }

  private waitForResult(retryCount:number) {
    this.game.getResult(this.state).subscribe((resp:Result)=>{
      if (resp.spy) {
        resp.applyTo(this.state);
      } else {
        setTimeout(()=>{
          this.waitForResult(retryCount);
        },GameComponent.pollingDelay)
      }
    },this.buildErrorHandler([404],retryCount,()=>{
      this.waitForResult(retryCount - 1);
    }))
  }

  toggleActiveLoc(i: number) {
    this.state.activeLocations[i] = !this.state.activeLocations[i];
  }

  guess(loc: string) {
    this.state.guess = loc;
    GameComponent.showModal("guess-modal");
  }

  cancelGuess() {
    delete this.state.guess;
    GameComponent.closeModal("guess-modal");
  }

  confirmGuess() {
    this.submitGuessRequest(GameComponent.defaultRetries);
    GameComponent.closeModal("guess-modal");
  }

  private submitGuessRequest(retryCount:number) {
    this.game.submitGuess(this.state).subscribe((resp:GuessResp)=>{
      // do-nothing
    },this.buildErrorHandler([404],retryCount,()=>{
      this.submitGuessRequest(retryCount - 1);
    }));
  }

  toggleActivePlayer(i: number) {
    this.state.activePlayers[i] = !this.state.activePlayers[i];
  }

  vote(player: string) {
    this.state.vote = player;
    GameComponent.showModal("vote-modal");
  }

  cancelVote() {
    delete this.state.vote;
    GameComponent.closeModal("vote-modal")
  }

  confirmVote() {
    this.submitVoteRequest(GameComponent.defaultRetries);
    GameComponent.closeModal("vote-modal")
  }

  private submitVoteRequest(retryCount:number) {
    this.game.submitVote(this.state).subscribe((resp:VoteResp)=>{
      // do-nothing
    },this.buildErrorHandler([404],retryCount,()=>{
      this.submitVoteRequest(retryCount - 1);
    }));
  }

  close() {
    GameComponent.showModal('close-modal');
  }

  cancelClose() {
    GameComponent.closeModal('close-modal');
  }

  confirmClose() {
    this.state.reset();
    this.submitCloseRequest(GameComponent.defaultRetries);
    GameComponent.closeModal('close-modal');
  }

  private submitCloseRequest(retryCount:number) {
    this.game.closeSession(this.state).subscribe((resp:CloseResp)=>{
      // do-nothing
    },this.buildErrorHandler([404],retryCount,()=>{
      this.submitCloseRequest(retryCount - 1);
    }));
  }
}
