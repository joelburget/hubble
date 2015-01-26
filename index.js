/* TODO batch *all* mutations
 * idea: freeze / thaw implementations for all types
 * lens constructor thaws, freeze delegates to type's freeze
 */

var util = require("./util.js");
    var clone = util.clone;
    var isObject = util.isObject;
    var merge = util.merge;

var arr = require('./arr.js');
var obj = require('./obj.js');
var str = require('./str.js');

// equivalents, without requiring it
// find the implementation to use for a given object
var dispatch = function(x) {
    if (Array.isArray(x)) {
        return arr;
    } else if (isObject(x)) {
        return obj;
    } else if (typeof x === "string") {
        return str;
    }
};

// This is underscore with a different name
var lens = function(obj) {
    if (obj instanceof lens) {
        return obj;
    }

    if (!(this instanceof lens)) {
        return new lens(obj);
    }

    var ops = dispatch(obj);
    this._wrapped = ops.thaw ? ops.thaw(obj) : obj;
};

lens.prototype.freeze = function() {
    var obj = this._wrapped;
    var ops = dispatch(obj);

    return ops.freeze ? ops.freeze(obj) : obj;
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
        obj = dispatch(obj).get(obj, lensArr[i]);
    }

    return obj;
};

lens.prototype.mod = function(lensArr, f) {
    var obj = this._wrapped;
    var newObj = clone(obj);
    var ops = dispatch(obj);

    if (lensArr.length === 0) {
        this._wrapped = f(this._wrapped);
    } else if (lensArr.length === 1) {
        this._wrapped = ops.mod(newObj, lensArr[0], f);
    } else {
        var monocle = lensArr[0];
        var shortLens = lensArr.slice(1);

        // newObj = ops.mod(obj[monocle], shortLens, f);

        newObj[monocle] = lens(obj[monocle])
            .mod(shortLens, f)
            .freeze();
        this._wrapped = newObj;
    }

    return this;
};

// TODO - move to individual files
lens.prototype.merge = function(lensArr, props) {
    this._wrapped = lens(this._wrapped).mod(lensArr, function(oldProps) {
        return merge(oldProps, props);
    }).freeze();

    return this;
};

// Lens must have length >= 1 or there would be nothing to return
lens.prototype.del = function(lensArr) {
    var obj = this._wrapped;
    var ops = dispatch(obj);

    if (lensArr.length === 1) {
        this._wrapped = ops.del(obj, lensArr[0]);
    } else {
        var monocle = lensArr[0];
        var shortLens = lensArr.slice(1);
        var newObj = clone(obj);

        newObj[monocle] = lens(obj[monocle])
            .del(shortLens)
            .freeze();

        this._wrapped = newObj;
    }

    return this;
};

lens.prototype.set = function(lensArr, set) {
    return this.mod(lensArr, function() { return set; });
};

module.exports = lens;
