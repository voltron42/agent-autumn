ns("Hiccup",
    {},
    ()=>{
        let build = (tpl)=>{
            if ((typeof tpl) === "string") {
                return document.createTextNode(tpl);
            } else if (Array.isArray(tpl)) {
                let tag = tpl.shift();
                let attrs = tpl.shift();
                let elem = document.createElement(tag);
                Object.entries(attrs).forEach((entry)=>{
                    let attr = document.createAttribute(entry[0]);
                    attr.value = entry[1];
                    elem.setElementNode(attr);
                });
                tpl.forEach((child)=>{
                    elem.appendChild(build(child));
                });
                return elem;
            } else {
                throw {
                    message:"invalid hiccup node",
                    body:tpl
                };
            }
        };
        return {
            build:build
        };
    });