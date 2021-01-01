export class NewGameReq {
  hostName: string;
  totalPlayerCount: number;
  durationMS: number;
  location: string;
  locList: string[];
  roleList: string[];

  constructor(formArgs: {
    playerName:string,
    addlPlayerCount:number,
    durationMinutes:number
  }, gameData:Map<string,string[]>) {
    this.hostName = formArgs.playerName;
    this.totalPlayerCount = formArgs.addlPlayerCount + 1;
    this.durationMS = formArgs.durationMinutes * 60 * 1000;
    this.locList = Array.from(gameData.keys());
    this.location = this.locList[Math.floor(Math.random() * this.locList.length)];
    this.roleList = gameData.get(this.location);
  }
}
