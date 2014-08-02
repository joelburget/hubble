var get = function(map, monocle) {
    return map.get(monocle);
};

var set = function(map, monocle, val) {
    return map.set(monocle, val);
};

var mod = function(map, monocle, f) {
    return map.set(monocle, f(map.get(monocle)));
};

var del = function(map, monocle) {
    return map.delete(monocle);
};

var freeze = function(map) {
    return map.asMutable();
};

var thaw = function(map) {
    return map.asImmutable();
};

module.exports = {
    get: get,
    set: set,
    mod: mod,
    del: del,
    freeze: freeze,
    thaw: thaw
};
