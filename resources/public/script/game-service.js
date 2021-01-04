ns("GameService",
  {
    "HttpClient":"hc",
    "GameData":"data",
    "Config":"cfg"
  },
  (_)=>{
    let defaultRetries = _.cfg.defaultRetries;
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
        return out;0
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
    let waitForHasJoined = (state,retryCount)=>{
      callGet("/game/" + state.get("sessionID") + "/has-joined",
        [404],defaultRetries,()=>{
          waitForHasJoined(state,retryCount-1);
        },buildBaseCallbacks(state,(resp)=>{
          if (state.get("hasJoined")) {
            waitForAllJoined(_.cfg.defaultRetries);
          } else {
            setTimeout(()=>{
              waitForHasJoined(state,retryCount);
            },_.cfg.pollingDelay);
          }
        }));
    };
    let submitHostRequest = ((state,hostName,playerCount,durationMinutes,retries)=>{
      let req = {
        hostName:hostName,
        totalPlayerCount:playerCount + 1,
        durationMS:durationMinutes * 60 * 1000,
      };
      req.locList = Object.keys(_.data);
      req.location = req.locList[Math.floor(Math.random() * req.locList.length)];
      req.roleList = _.data[req.location];
      callPost("/host",req,[404],)
      _.hc.send({
        method:"post",
        url:"/host",
        body:req,
        callbacks:{
          200:(resp)=>{
            state.set("sessionID",resp.body.sessionID);
            waitForHasJoined(state);
          },
          404:(resp)=>{
            if (retries > 0) {
              setTimeout(()=>{
                submitHostRequest(state,hostName,playerCount,durationMinutes,retries-1);
              },_.cfg.retryDelay);
            }
          },
          default:(resp)=>{
            state.reset();
          }
        },
      });
    });
    return {
      hostNewGame:(state,hostName,playerCount,durationMinutes)=>{
        submitHostRequest(state,hostName,playerCount,durationMinutes,_.cfg.defaultRetries);
      },
    };
  });