var get = function(arr, monocle) {
    return arr[monocle];
};

var set = function(arr, monocle, val) {
    var newArr = arr.splice();
    newArr[monocle] = val;
    return newArr;
};

var mod = function(arr, monocle, f) {
    var newArr = arr.splice();
    newArr[monocle] = f(arr[monocle]);
    return newArr;
};

var del = function(arr, monocle) {
    var newArr = arr.slice();
    newArr.splice(monocle);
    return newArr;
};

module.exports = { get: get, set: set, mod: mod, del: del };
