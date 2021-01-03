ns("GameService",
    {
        "HttpClient":"hc",
        "GameData":"data"
    },
    (imports)=>{
        let retryDelay = 1000;
        let submitHostRequest = ((state,hostName,playerCount,durationMinutes,retries)=>{
            let req = {
                hostName:hostName,
                totalPlayerCount:playerCount + 1,
                durationMS:durationMinutes * 60 * 1000,
            };
            req.locList = Object.keys(imports.data);
            req.location = req.locList[Math.floor(Math.random() * req.locList.length)];
            req.roleList = imports.data[req.location];
            imports.hc.send({
                method:"post",
                url:"/host",
                body:req,
                callback:(resp)=>{
                    switch(resp.status) {
                        case 200:
                            state.sessionID = resp.body.sessionID;
                            return;
                        case 404:
                            if (retries > 0) {
                                setTimeout(()=>{
                                    submitHostRequest(state,hostName,playerCount,durationMinutes,retries-1);
                                },retryDelay);
                            }
                            return;
                        default:
                            state.reset();
                    }
                }
            });
        });
        return {
            hostNewGame:(state,hostName,playerCount,durationMinutes)=>{
                submitHostRequest(state,hostName,playerCount,durationMinutes);
            },
        };
    });