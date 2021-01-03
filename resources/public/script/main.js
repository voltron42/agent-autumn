ns("Main",
    {"GameState":"GameState"},
    (imports)=>{
        let buildRender = (bodyElem) => {
            let render = (state)=>{
                let out = [];
                if (!state.get("sessionID")) {

                } else if (state.get("sessionID") && state.get("isHost") && state.get("joining")) {

                } else if (state.get("sessionID") && !state.get("isHost") && state.get("joining")) {

                } else if (state.get("sessionID") && !state.get("joining") && !state.get("haveAllJoined")) {

                } else if (state.get("haveAllJoined") && !state.get("endTime") && state.get("isHost")) {

                } else if (state.get("haveAllJoined") && !state.get("endTime") && !state.get("isHost")) {

                } else if (state.get("endTime") && !state.get("spy")) {

                } else if (state.get("spy")) {

                }
                if (state.get("sessionID") && state.get("isHost")) {

                }
                bodyElem.innerHTML = "";
                out.forEach((child)=>{
                    bodyElem.appendChild(child);
                });
            };
        };
        return (bodyElem)=>{
            let render = buildRender(bodyElem);
            let state = new imports.GameState(render);
            render(state);
        };
    });