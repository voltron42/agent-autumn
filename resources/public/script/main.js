ns("Main",
  {
    "GameState":"GameState",
    "Hiccup":"h"
  },
  (imports)=>{
    let buildRender = (bodyElem) => {
      let render = (state)=>{
        let cancelJoinWait = ()=>{
        };
        let startGame = ()=>{
        }
        let out = [];
        if (!state.get("sessionID")) {

        } else if (state.get("sessionID") && state.get("isHost") && state.get("joining")) {
          out.push([
            "div",
            {"class":"text-center"},
            ["h3",{},"Waiting for confirmation of host ..."]
          ]);
        } else if (state.get("sessionID") && !state.get("isHost") && state.get("joining")) {
          out.push([
            "div",
            {"class":"text-center"},
            ["h3",{},"Waiting for confirmation of join ..."],
            ["button",{"class":"nes-btn is-warning","click":cancelJoinWait},"Cancel"]
          ]);
        } else if (state.get("sessionID") && !state.get("joining") && !state.get("haveAllJoined")) {
          out.push([
            "div",
            {"class":"text-center"},
            ["h3",{},"Waiting for players to join ..."]
          ]);
        } else if (state.get("haveAllJoined") && !state.get("endTime") && state.get("isHost")) {
          out.push([
            "div",
            {"class":"text-center"},
            ["button",{"class":"nes-btn is-warning","click":startGame},"START GAME"]
          ]);
        } else if (state.get("haveAllJoined") && !state.get("endTime") && !state.get("isHost")) {
          out.push([
            "div",
            {"class":"text-center"},
            ["h3",{},"Waiting for host to start game ..."]
          ]);
        } else if (state.get("endTime") && !state.get("spy")) {

        } else if (state.get("spy")) {
          out.push([
            "div",
            {"class":"d-flex flex-column text-center"},
            ["div", {}, state.get("result")],
            ["div", {}, ((state.get("role")==="spy")?("Location: " + state.get("location")):("Spy: " + state.get("spy")))],
          ]);
        }
        if (state.get("sessionID") && state.get("isHost")) {
          
        }
        bodyElem.innerHTML = "";
        out.forEach((child)=>{
          bodyElem.appendChild(imports.h.build(child));
        });
      };
    };
    return (bodyElem)=>{
      let render = buildRender(bodyElem);
      let state = new imports.GameState(render);
      render(state);
    };
  });