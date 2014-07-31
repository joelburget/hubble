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
    if (this._zoomLevels === undefined) {
        this._zoomLevels = [];
    }

    this._zoomLevels.push({
        zoom: lensArr,
        wrapped: this._wrapped
    });
    this._wrapped = lens(this._wrapped).get(lensArr);

    return this;
};

// TODO?
lens.prototype.zoomC = lens.prototype.zoom;

lens.prototype.deZoom = function() {
    var level = this._zoomLevels.pop();
    this._wrapped = lens(level.wrapped).set(level.zoom, this._wrapped);

    return this;
};

// TODO?
lens.prototype.deZoomC = lens.prototype.deZoom;

lens.prototype.getC = function(lensArr) {
    for (var i = 0; i < lensArr.length; i++) {
        this._wrapped = this._wrapped[lensArr[i]];
    }

    return this;
};

lens.prototype.modC = function(lensArr, mod) {
    var obj = this._wrapped;

    if (lensArr.length === 0) {
        this._wrapped = mod(obj);
    } else {
        var monocle = lensArr[0];
        var newObj = clone(obj);
        newObj[monocle] = lens(obj[monocle]).mod(lensArr.slice(1), mod);
        this._wrapped = newObj;
    }

    return this;
};

lens.prototype.mergeC = function(lensArr, props) {
    this._wrapped = lens(this._wrapped).mod(lensArr, function(oldProps) {
        return merge(oldProps, props);
    });

    return this;
};

// Lens must have length >= 1 or there would be nothing to return
lens.prototype.delC = function(lensArr) {
    var newObj = clone(this._wrapped);
    if (lensArr.length === 1) {
        delete newObj[lensArr[0]];
    } else {
        var newSubObj = lens(newObj[lensArr[0]]).del(lensArr.slice(1));
        newObj[lensArr[0]] = newSubObj;
    }

    this._wrapped = newObj;
    return this;
};

lens.prototype.setC = function(lensArr, set) {
    return this.modC(lensArr, function() { return set; });
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

// Creates a chainable version of the method named by accessor. Basically,
// modifies it so that it returns a new instance of lens rather than a bare
// object.
var unChain = function(accessor) {
    // lens functions take up to two arguments - pass them through
    return function(b, c) {
        return this[accessor].call(this, b, c)._wrapped;
    };
};

lens.prototype.get          = unChain("getC");
lens.prototype.mod          = unChain("modC");
lens.prototype.set          = unChain("setC");
lens.prototype.del          = unChain("delC");
lens.prototype.merge        = unChain("mergeC");
lens.prototype.insertAt     = unChain("insertAtC");
lens.prototype.insertBefore = unChain("insertBeforeC");
lens.prototype.insertAfter  = unChain("insertAfterC");

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
