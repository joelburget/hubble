/*
 * javascript's native object/array weren't built for this kind of manipulation
 * - replace them with mori/something else?
 */

// prelude: implement a few helpers which do the same as their underscore
// equivalents, without requiring it

var isObject = function(obj) {
    return obj === Object(obj);;
}

var merge = function() {
    var obj = {};

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    }

    return obj;
};

var clone = function(obj) {
    if (!isObject(obj)) {
        return obj;
    }

    return Array.isArray(obj) ? obj.slice() : merge(obj);
};

// end prelude

// This is underscore with a different name
var lens = function(obj) {
    if (obj instanceof lens) {
        return obj;
    }

    if (!(this instanceof lens)) {
        return new lens(obj);
    }

    this._wrapped = obj;
};

lens.prototype.zoom = function(lensArr) {
    if (this._zoomStack === undefined) {
        this._zoomStack = [];
    }

    this._zoomStack.push({
        zoom: lensArr,
        wrapped: this._wrapped
    });
    this._wrapped = lens(this._wrapped).get(lensArr);

    return this;
};

lens.prototype.deZoom = function() {
    var frame = this._zoomStack.pop();
    this._wrapped = lens(frame.wrapped)
        .set(frame.zoom, this._wrapped)
        .freeze();

    return this;
};

lens.prototype.get = function(lensArr) {
    var obj = this._wrapped;
    for (var i = 0; i < lensArr.length; i++) {
        obj = obj[lensArr[i]];
    }

    return obj;
};

lens.prototype.mod = function(lensArr, mod) {
    var obj = this._wrapped;

    if (lensArr.length === 0) {
        this._wrapped = mod(obj);
    } else {
        var monocle = lensArr[0];
        var newObj = clone(obj);
        newObj[monocle] = lens(obj[monocle])
            .mod(lensArr.slice(1), mod)
            .freeze();
        this._wrapped = newObj;
    }

    return this;
};

lens.prototype.merge = function(lensArr, props) {
    this._wrapped = lens(this._wrapped).mod(lensArr, function(oldProps) {
        return merge(oldProps, props);
    }).freeze();

    return this;
};

// Lens must have length >= 1 or there would be nothing to return
lens.prototype.del = function(lensArr) {
    var newObj = clone(this._wrapped);
    if (lensArr.length === 1) {
        delete newObj[lensArr[0]];
    } else {
        var newSubObj = lens(newObj[lensArr[0]])
            .del(lensArr.slice(1))
            .freeze();
        newObj[lensArr[0]] = newSubObj;
    }

    this._wrapped = newObj;
    return this;
};

lens.prototype.set = function(lensArr, set) {
    return this.mod(lensArr, function() { return set; });
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

lens.prototype.freeze = function() {
    return this._wrapped;
};

module.exports = lens;

// examples
//
// > lens({ x: 1, y: 2 }).del(['x'])
// { y: 2 }
//
// > lens({ x: 1, y: 2 }).set(['y'], 3)
// { x: 1, y: 3 }
//
// > lens({ x: 1, y: 2 }).mod(['y'], function(y) { return y + 1; })
// { x: 1, y: 3 }
//
// > lens({ x: 1, y: 2 }).get(['x'])
// 1
//
// > lens([0, 1, 2]).insertAt([3], 3)
// [0, 1, 2, 3]
//
// > lens([0, 1, 2]).insertBefore([0], -1)
// [-1, 0, 1, 2]
//
// > lens([0, 1, 2]).insertAfter([2], 3)
// [0, 1, 2, 3]
