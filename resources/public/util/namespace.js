(function(){
    let namespaces = {};
    let me = this;
    this.ns = function(name, imports, init) {
        if (namespaces[name]) {
            throw new Error("Namespace '" + name + "' has already been declared.");
        }
        namespaces[name] = {
            imports:imports,
            init:init
        };
    };
    let recurse = function(name, path) {
        if (!namespaces[name]) {
            throw new Error("Namespace '" + name + "' does not exist.");
        }
        if (path.indexOf(name) >= 0) {
            throw new Error("Circular dependency: " + path.concat(name).join(" -> "));
        }
        let service = namespaces[name];
        if (service.service) {
            return service.service;
        }
        namespaces[name] = {
            service:service.init(Object.entries(service.imports).reduce(function(out,entry) {
                out[entry[1]] = recurse(entry[0], path.concat(name));
                return out;
            },{}))
        };
        return namespaces[name].service;
    };
    this.importNamespace = function(name) {
        return recurse(name, []);
    }
})();
