ns("GameState",
    {},
    ()=>{
        return (onChangeFn)=>{
            let props = {};
            let me = this;
            let set = (key,value)=>{
                props[key] = value;
                onChangeFn(me);
            };
            this.reset = ()=>{
                Object.keys(props).forEach((key)=>{
                    delete props[key];
                });
                onChangeFn(me);
            };
            this.setSessionId = (sessionId)=>{
                props.sessionId = sessionId;
            };
            this.host = ()=>{
                props.isHost = true;
                props.joining = true;
            };
            this.join = ()=>{
                props.isHost = false;
                props.joining = true;
            };
            this.setJoined = ()=>{
                props.joining = false;
            };
            this.setAllHaveJoined = ()=>{
                props.haveAllJoined = true;
            }
            this.applyReady = (ready)=>{};
            this.applyResult = (result)=>{};
        };
    });