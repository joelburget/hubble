var clone = require("./util.js").clone;

var get = function(obj, monocle) {
    return obj[monocle];
};

var set = function(obj, monocle, val) {
    var newObj = clone(obj);
    newObj[monocle] = val;
    return newObj;
};

var mod = function(obj, monocle, f) {
    var newObj = clone(obj);
    newObj[monocle] = f(obj[monocle]);
    return newObj;
};

var del = function(obj, monocle) {
    var newObj = clone(obj);
    delete newObj[monocle];
    return newObj;
};

module.exports = { get: get, set: set, mod: mod, del: del };
