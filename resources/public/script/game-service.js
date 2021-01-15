ns("GameService",
  {
    "HttpClient":"hc",
    "GameData":"data",
    "Config":"cfg"
  },
  (_)=>{
    let defaultRetries = _.cfg.defaultRetries;
    let pollingDelay = _.cfg.pollingDelay;
    let buildBaseCallbacks = (state,successFn) => {
      return {
        200:successFn,
        default:(resp)=>{
          state.reset();
        }
      }
    };
    let call = (baseReq,url,method,retryCodes,retryCount,onRetry,baseCallbacks) =>{
      let retryFn = () => {
        if (retryCount > 0) {
          setTimeout(onRetry,_.cfg.retryDelay);
        }
      };
      _.hc.send(Object.entries(baseReq).reduce((out,entry)=>{
        out[entry[0]] = entry[1];
        return out;
      },{
        method:method,
        url:url,
        callbacks:retryCodes.reduce((out,code)=>{
          out[code] = retryFn;
          return out;
        },baseCallbacks)
      }));
    };
    let callGet = (url,retryCodes,retryCount,onRetry,baseCallbacks)=>{
      call({},url,"get",retryCodes,retryCount,onRetry,baseCallbacks);
    };
    let callPost = (url,body,retryCodes,retryCount,onRetry,baseCallbacks)=>{
      call({body:body},url,"put",retryCodes,retryCount,onRetry,baseCallbacks);
    };
    let callPut = (url,body,retryCodes,retryCount,onRetry,baseCallbacks)=>{
      call({body:body},url,"put",retryCodes,retryCount,onRetry,baseCallbacks);
    };
    let callDelete = (url,retryCodes,retryCount,onRetry,baseCallbacks)=>{
      call({},url,"delete",retryCodes,retryCount,onRetry,baseCallbacks);
    };
    let waitForResult = (state,retryCount)=>{
      callGet("/game/" + state.get("sessionID") + "/result",
        [404],retryCount,()=>{
          waitForResult(state,retryCount-1);
        },buildBaseCallbacks(state,(resp)=>{
          if (resp.body.spy) {
            state.applyResult(resp.body);
            // final state
          } else {
            setTimeout(()=>{
              waitForResult(state,defaultRetries);
            },pollingDelay);
          }
        }));
    };
    let waitForStart = (state,retryCount)=>{
      callGet("/game/" + state.get("sessionID") + "/ready",
        [404],retryCount,()=>{
          waitForStart(state,retryCount-1);
        },buildBaseCallbacks(state,(resp)=>{
          if (resp.body.endTime) {
            state.applyReady(resp.body);
            waitForResult(state,defaultRetries);
          } else {
            setTimeout(()=>{
              waitForStart(state,defaultRetries);
            },pollingDelay);
          }
        }));
    };
    let waitForAllJoined = (state,retryCount)=>{
      callGet("/game/" + state.get("sessionID") + "/all-joined",
        [404],retryCount,()=>{
          waitForAllJoined(state,retryCount-1);
        },buildBaseCallbacks(state,(resp)=>{
          if (resp.body.allJoined) {
            state.setAllHaveJoined();
            if (!state.get("isHost")) {
              waitForStart(state,defaultRetries);
            }
          } else {
            setTimeout(()=>{
              waitForAllJoined(state,defaultRetries);
            },pollingDelay);
          }
        }));
    };
    let waitForHasJoined = (state,retryCount)=>{
      callGet("/game/" + state.get("sessionID") + "/has-joined",
        [404],retryCount,()=>{
          waitForHasJoined(state,retryCount-1);
        },buildBaseCallbacks(state,(resp)=>{
          if (resp.body.hasJoined) {
            state.setJoined();
            waitForAllJoined(state,defaultRetries);
          } else {
            setTimeout(()=>{
              waitForHasJoined(state,defaultRetries);
            },pollingDelay);
          }
        }));
    };
    let submitHostRequest = ((state,formData,retries)=>{
      let req = {
        hostName:formData["host-name"],
        totalPlayerCount:formData["player-count"] + 1,
        durationMS:formData["duration"] * 60 * 1000,
      };
      req.locList = Object.keys(_.data);
      req.location = req.locList[Math.floor(Math.random() * req.locList.length)];
      req.roleList = _.data[req.location];
      state.host();
      callPost("/host",req,[404],retries,()=>{
        submitHostRequest(state,hostName,playerCount,durationMinutes,retries-1);
      },buildBaseCallbacks(state,(resp)=>{
        state.setSessionId(resp.body.sessionID);
        waitForHasJoined(state,defaultRetries);
      }));
    });
    let startGameClock = ((state,retries)=>{
      callPost("/game/" + state.get("sessionID") + "/start-clock",
        {},[404],retries,()=>{
          startGameClock(state,retries - 1);
        },buildBaseCallbacks(state,(resp)=>{
          waitForStart(state,defaultRetries);
        }));
    });
    let submitJoinRequest = ((state,retries)=>{
      state.join();
      callPost("/game/" + state.get("sessionID") + "/join",{playerName:state.get("playerName")},
        [404],retries,()=>{
          submitJoinRequest(state,retries-1);
        },buildBaseCallbacks(state,(resp)=>{
          waitForHasJoined(state,defaultRetries);
        }));
    });
    let submitVote = ((state,retries)=>{
      callPost("/game/" + state.get("sessionID") + "/vote",
        {targetName:state.get("vote")},
        [404],retries,()=>{
          submitVote(state,retries-1);
        },buildBaseCallbacks(state,(resp)=>{
          //do-nothing;
        }));
    });
    let submitGuess = ((state,retries)=>{
      callPost("/game/" + state.get("sessionID") + "/guess",
        {location:state.get("guess")},
        [404],retries,()=>{
          submitGuess(state,retries-1);
        },buildBaseCallbacks(state,(resp)=>{
          //do-nothing;
        }));
    });
    let submitClose = ((state,retries)=>{
      callDelete("/game/" + state.get("sessionID") + "/close",
        [404],retries,()=>{
          submitClose(state,retries-1);
        },buildBaseCallbacks(state,(resp)=>{
          //do-nothing;
        }));
    });
    return {
      hostNewGame:(state,formData)=>{
        submitHostRequest(state,formData,defaultRetries);
      },
      startClock:(state)=>{
        startGameClock(state,defaultRetries);
      },
      joinGame:(state)=>{
        submitJoinRequest(state,defaultRetries);
      },
      vote:(state)=>{
        submitVote(state,defaultRetries);
      },
      guess:(state)=>{
        submitGuess(state,defaultRetries);
      },
      close:(state)=>{
        submitClose(state,defaultRetries);
      }
    };
  });