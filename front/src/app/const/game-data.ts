export const GAME_DATA: Map<string,string[]> = Object.entries({
  RACETRACK:["DRIVER","PIT CREW","ANNOUNCER","SPECTATOR"]
}).reduce((out:Map<string,string[]>,entry)=>{
  out.set(entry[0],entry[1]);
  return out;
},new Map<string,string[]>());
