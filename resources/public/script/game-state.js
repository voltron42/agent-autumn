ns("GameState",
    {},
    ()=>{
        return (onChangeFn)=>{
            let props = {};
            let me = this;
            this.set = (key,value)=>{
                props[key] = value;
                onChangeFn(me);
            };
            this.setIn = (keys,value)=>{
                let finalKey = keys.pop();
                let obj = keys.reduce((out,key)=>{
                    return out[key];
                },props);
                obj[finalKey] = value;
                onChangeFn(me);
            };
            this.setAll = (aMap)=>{
                Object.entries(aMap).forEach((entry)=>{
                    props[entry[0]] = props[entry[1]];
                });
                onChangeFn(me)
            };
            this.get = (key)=>{
                return props[key];
            };
            this.getIn = (keys)=>{
                return keys.reduce((out,key)=>{
                    return out[key];
                },props);
            }
            this.delete = (key)=>{
                delete props[key];
                onChangeFn(me);
            };
            this.reset = ()=>{
                Object.keys(props).forEach((key)=>{
                    delete props[key];
                });
                onChangeFn(me);
            };
        };
    });