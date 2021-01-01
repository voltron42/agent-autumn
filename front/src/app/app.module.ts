import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameOverComponent } from './components/game-over/game-over.component';
import { SpyComponent } from './components/spy/spy.component';
import { InitComponent } from './components/init/init.component';
import { JoinComponent } from './components/join/join.component';
import { JoinLinkComponent } from './components/join-link/join-link.component';
import { RoleComponent } from './components/role/role.component';
import { WaitingComponent } from './components/waiting/waiting.component';
import { GameComponent } from './components/game/game.component';

@NgModule({
  declarations: [
    AppComponent,
    GameOverComponent,
    SpyComponent,
    InitComponent,
    JoinComponent,
    JoinLinkComponent,
    RoleComponent,
    WaitingComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
