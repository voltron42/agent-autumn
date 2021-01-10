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
                Object.entries(attrs).forEach((entry) => {
                    if ((typeof entry[1]) === "function") {
                        elem.addEventListener(entry[0], entry[1]);
                    } else {
                        let attr = document.createAttribute(entry[0]);
                        attr.value = entry[1];
                        elem.setElementNode(attr);
                    }
                });
                tpl.forEach((child) => {
                    elem.appendChild(build(child));
                });
                return elem;
            } else if (tpl instanceof Element) {
                return tpl;
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