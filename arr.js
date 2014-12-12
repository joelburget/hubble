var get = function(arr, monocle) {
    return arr[monocle];
};

var set = function(arr, monocle, val) {
    var newArr = arr.splice();
    newArr[monocle] = val;
    return newArr;
};

var mod = function(arr, monocle, f) {
    var newArr = arr.slice();
    newArr[monocle] = f(arr[monocle]);
    return newArr;
};

var del = function(arr, monocle) {
    var newArr = arr.slice();
    newArr.splice(monocle, 1);
    return newArr;
};

/*
// Lens must point to a member of an array. We'll insert into that array.
lens.prototype.insertAt = function(lensArr, toInsert) {
    var obj = this._wrapped;

    var arrLens = lensArr.slice(0, -1);
    var arr = lens(obj).get(arrLens).slice(); // slice to copy

    var arrIdx = lensArr[lensArr.length-1];
    arr.splice(arrIdx, 0, toInsert);
    return lens(obj).set(arrLens, arr);
};

lens.prototype.insertBefore = lens.prototype.insertAt;
lens.prototype.insertAfter = function(lensArr, toInsert) {
    var newLens = lensArr.slice();
    newLens[newLens.length-1] += 1;
    return lens(this._wrapped).insertAt(newLens, toInsert);
};
*/

module.exports = { get: get, set: set, mod: mod, del: del };
