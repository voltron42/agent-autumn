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
            this.setAll = (aMap)=>{
                Object.entries(aMap).forEach((entry)=>{
                    props[entry[0]] = props[entry[1]];
                });
                onChangeFn(me)
            };
            this.get = (key)=>{
                return props[key];
            };
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