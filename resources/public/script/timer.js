ns("Timer",
    {},
    ()=>{
        let applyLeadingZeroes = (count,value) => {
            return "?".repeat(count).split("").map((v,i)=>{
                return (Math.pow(10,count-i)>value?"0":"");
            }).join("") + value;
        };
        let getTimeRemaining=((endTime)=>{
            let now = (new Date()).getTime();
            if (now < endTime ) {
                let diff = Math.floor((endTime - now)/1000);
                return [
                    Math.floor(diff/60),
                    diff % 60
                ].map((v)=>{
                    return applyLeadingZeroes(1,v);
                }).join(":");
            } else {
                return "00:00";
            }
        });
        let pollingDelay = 300;
        let scheduleUpdate=((updateFn)=>{
            setTimeout(()=>{
                updateFn();
                scheduleUpdate(updateFn);
            },pollingDelay);
        });
        return {
            start:((endTime)=>{
                let elem = document.createElement("span");
                elem.innerHTML = getTimeRemaining(endTime);
                scheduleUpdate(()=>{
                    elem.innerHTML = getTimeRemaining(endTime);
                });
                return elem;
            })
        };
    });