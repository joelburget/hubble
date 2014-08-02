var get = function(vect, monocle) {
    return vect.get(monocle);
};

var set = function(vect, monocle, val) {
    return vect.set(monocle, val);
};

var mod = function(vect, monocle, f) {
    return vect.set(monocle, f(vect.get(monocle)));
};

var del = function(vect, monocle) {
    return vect.splice(monocle, 1);
};

module.exports = { get: get, set: set, mod: mod, del: del };
