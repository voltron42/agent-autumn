ns("Main",
  {
    "GameState":"GameState",
    "GameService":"gs",
    "FormBuilder":"fb",
    "Hiccup":"h",
    "Timer":"t"
  },
(_)=>{
    let game = _.gs;
    let hostForm = _.fb.build(["host-name","player-count","duration"]);
    let joinForm = _.fb.build(["session-id","player-name"]);
    let buildRender = (bodyElem) => {
      let render = (state)=>{
        let hostModalId = "host-modal";
        let joinModalId = "join-modal";
        let closeModalId = "close-modal";
        let guessModalId = "guess-modal";
        let voteModalId = "vote-modal";
        let showModal = (elemId)=>{
          document.getElementById(elemId).showModal();
        };
        let closeModal = (elemId)=>{
          document.getElementById(elemId).close();
        };
        let host = ()=>{
          showModal(hostModalId)
        };
        let cancelHost = ()=>{
          closeModal(hostModalId);
        };
        let confirmHost = ()=>{
          game.hostNewGame(state,hostForm.getData());
          closeModal(hostModalId);
        };
        let join = ()=>{
          showModal(joinModalId);
        };
        let cancelJoin = ()=>{
          closeModal(joinModalId);
        };
        let confirmJoin = ()=>{
          state.setAll({
            "sessionID":joinForm.get("session-id"),
            "playerName":joinForm.get("player-name")
          });
          game.joinGame(state);
          closeModal(joinModalId);
        };
        let cancelJoinWait = ()=>{
        };
        let startGame = ()=>{
          game.startClock(state);
        };
        let promptCloseModal = ()=>{
          showModal(closeModalId);
        };
        let cancelClose = ()=>{
          closeModal(closeModalId);
        };
        let confirmClose = ()=>{
          game.close(state);
          closeModal(closeModalId);
        };
        let guess = (loc)=>{
          return ()=>{
            document.getElementById("my-guess").innerHTML = loc;
            showModal(guessModalId);
          };
        };
        let toggleActiveLoc = (i)=>{
          return ()=>{
            state.setIn(["activeLocations",i],!state.getIn(["activeLocations",i]));
          };
        };
        let cancelGuess = ()=>{
          closeModal(guessModalId);
        };
        let confirmGuess = ()=>{
          state.set("guess",document.getElementById("my-guess").innerHTML);
          closeModal(guessModalId);
        };
        let vote = (player)=>{
          return ()=>{
            document.getElementById("my-vote").innerHTML = player;
            showModal(voteModalId);
          };
        };
        let toggleActivePlayer = (i)=>{
          return ()=>{
            state.setIn(["activePlayers",i],!state.getIn(["activePlayers",i]));
          };
        };
        let cancelVote = ()=>{
          closeModal(voteModalId);
        };
        let confirmVote = ()=>{
          state.set("vote",document.getElementById("my-vote").innerHTML);
          closeModal(voteModalId);
        };
        let out = [];
        if (!state.get("sessionID")) {
          out.push([
            "div",
            {"class":"d-flex flex-column text-center"},
            ["button",{"class":"nes-btn is-success","click":host},"HOST"],
            ["button",{"class":"nes-btn is-primary","click":join},"JOIN"],
            ["dialog",{"class":"nes-dialog is-rounded","id":"host-modal"},
              ["form",{"method":"dialog"},
                ["p",{"class":"title"},"Host Game"],
                ["div",{"class":"nes-field"},
                  ["label",{"for":"host-name"},"Player Name:"],
                  ["input",{"type":"text","id":"host-name","class":"nes-input"}]],
                ["div",{"class":"nes-field"},
                  ["label",{"for":"player-count"},"Additional Player Count:"],
                  ["input",{"type":"number","id":"player-count","class":"nes-input"}]],
                ["div",{"class":"nes-field"},
                  ["label",{"for":"duration"},"Game Clock (minutes):"],
                  ["input",{"type":"number","id":"duration","class":"nes-input"}]],
                ["menu",{"class":"dialog-menu"},
                  ["button",{"class":"nes-btn","click":cancelHost},"Cancel"],
                  ["button",{"class":"nes-btn is-primary","click":confirmHost},"Confirm"],]]],
            ["dialog",{"class":"nes-dialog is-rounded","id":"join-modal"},
              ["form",{"method":"dialog"},
                ["p",{"class":"title"},"Join Game"],
                ["div",{"class":"nes-field"},
                  ["label",{"for":"session-id"},"Session ID:"],
                  ["input",{"type":"text","id":"session-id","class":"nes-input"}]],
                ["div",{"class":"nes-field"},
                  ["label",{"for":"player-name"},"Player Name:"],
                  ["input",{"type":"text","id":"player-name","class":"nes-input"}]],
                ["menu",{"class":"dialog-menu"},
                  ["button",{"class":"nes-btn","click":cancelJoin},"Cancel"],
                  ["button",{"class":"nes-btn is-primary","click":confirmJoin},"Confirm"],]]]
          ]);
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
          let frame = [
            "div",{"class":"d-flex flex-column text-center"},
            ["div",_.t.start(state.get("endTime"))]];
          if (state.get("role") === "SPY" && !state.get("guess")) {
            frame.push([
              "div",{"class":"nes-container with-title"},
              ["span",{"class":"title"},"Locations"],
              ["div",{"class":"d-flex flex-column text-center"}
              ].concat(state.get("locations").map((loc,i)=>{
                return ["div",{},
                  ["button",{"class":"nes-btn is-primary","click":guess(loc)},loc],
                  ["button",{"class":"nes-btn is-error","click":toggleActiveLoc(i)},"X"]];
              })),
              ["dialog",{"class":"nes-dialog is-rounded","id":guessModalId},
                ["form",{"method":"dialog"},
                  ["p",{"class":"title"},"Guess?"],
                  ["p",{},"Are you sure you wish to guess '",["span",{"id":"my-guess"}],"'?"],
                  ["menu",{"class":"dialog-menu"},
                    ["button",{"class":"nes-btn","click":cancelGuess},"Cancel"],
                    ["button",{"class":"nes-btn is-primary","click":confirmGuess},"Confirm"]]]]
            ]);
          }
          if (state.get("role") === "SPY" && state.get("guess")) {
            frame.push([
              "div",{"class":"nes-container with-title"},
              ["span",{"class":"title"},"Locations"],
              ["div",{},"Guessed: " + state.get("guess")]
            ]);
          }
          if (!state.get("vote")) {
            frame.push([
              "div",{"class":"nes-container with-title"},
              ["span",{"class":"title"},"Players"],
              ["div",{"class":"d-flex flex-column text-center"}
              ].concat(state.get("players").map((player,i)=>{
                return ["div",{},
                  ["button",{"class":"nes-btn is-primary","click":vote(player)},player],
                  ["button",{"class":"nes-btn is-error","click":toggleActivePlayer(i)},"X"]];
              })),
              ["dialog",{"class":"nes-dialog is-rounded","id":voteModalId},
                ["form",{"method":"dialog"},
                  ["p",{"class":"title"},"Vote?"],
                  ["p",{},"Are you sure you wish to vote for '",["span",{"id":"my-vote"}],"'?"],
                  ["menu",{"class":"dialog-menu"},
                    ["button",{"class":"nes-btn","click":cancelVote},"Cancel"],
                    ["button",{"class":"nes-btn is-primary","click":confirmVote},"Confirm"]]]]
            ]);
          }
          if (state.get("vote")) {
            frame.push([
              "div",{"class":"nes-container with-title"},
              ["span",{"class":"title"},"Players"],
              ["div",{},"Voted: " + state.get("vote")]
            ]);
          }
          out.push(frame);
        } else if (state.get("spy")) {
          out.push([
            "div",
            {"class":"d-flex flex-column text-center"},
            ["div", {}, state.get("result")],
            ["div", {}, ((state.get("role")==="spy")?("Location: " + state.get("location")):("Spy: " + state.get("spy")))],
          ]);
        }
        if (state.get("sessionID") && state.get("isHost")) {
          out.push([
            "div",
            {"class":"d-flex flex-column text-center"},
            ["button",
              {"class":"nes-btn is-error",
                "click":promptCloseModal},
              "CLOSE GAME"],
            ["dialog",
              {"class":"nes-dialog is-rounded",
                "id":closeModalId},
              ["form",
                {"method":"dialog"},
                ["p", {"class":"title"},"Close?"],
                ["p","Are you sure you wish to close this game session?"],
                ["menu",
                  {"class":"dialog-menu"},
                  ["button",
                    {"class":"nes-btn",
                      "click":cancelClose},
                    "Cancel"],
                  ["button",
                    {"class":"nes-btn is-primary",
                      "click":confirmClose},
                    "Confirm"]]]]]);
        }
        bodyElem.innerHTML = "";
        out.forEach((child)=>{
          bodyElem.appendChild(_.h.build(child));
        });
      };
    };
  return (bodyElem)=>{
      let render = buildRender(bodyElem);
      let state = new _.GameState(render);
      render(state);
    };
});
