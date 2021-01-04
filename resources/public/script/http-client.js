ns("HttpClient",
    {},
    (imports)=>{
        return {
            send:(req)=>{
                let xhttp = (window.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP"));
                xhttp.onreadystatechange = ()=>{
                    if (xhttp.readyState === XMLHttpRequest.DONE) {
                        let body = xhttp.responseText;
                        let type = xhttp.responseType;
                        if (type === "json") {
                            body = JSON.parse(body);
                        }
                        let headers = xhttp.getAllResponseHeaders().split("\r\n").reduce((out,row)=>{
                            let splitLine = row.indexOf(":");
                            let key = splitLine.substr(0,splitLine).trim();
                            out[key] = splitLine.substr(splitLine+1).trim();
                            return out;
                        },{});
                        let resp = {
                            status:xhttp.status,
                            body:body,
                            type:type,
                            headers:headers
                        };
                        if ((typeof req.callback) === "function") {
                            req.callback(resp);
                        } else if ((typeof req.callbacks) === "object") {
                            let statusCallback = req.callbacks[resp.status];
                            let defaultCallback = req.callbacks["default"];
                            if (statusCallback) {
                                statusCallback(resp);
                            } else if (defaultCallback) {
                                defaultCallback(resp);
                            }
                        }
                    }
                };
                let reqBody = req.body;
                if ((typeof reqBody) === "object") {
                    reqBody = JSON.stringify(reqBody);
                }
                xhttp.open(req.method,req.url,true);
                if (reqBody) {
                    xhttp.send(reqBody);
                } else {
                    xhttp.send();
                }
            }
        };
    });