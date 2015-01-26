var assert = require("chai").assert;
var lens = require("../index.js");

var recipe = {
    ingredients: [
        {
            name: "chocolate",
            quantity: "1 cup"
        }
    ],
    steps: [
        "unwrap chocolate",
        "eat chocolate"
    ]
};


describe("get", function() {
    it("should get elements of objects, arrays, and strings", function() {

        assert.equal(lens(recipe).get([]), recipe);

        assert.equal(
            lens(recipe).get(["ingredients"]),
            recipe["ingredients"]
        );

        assert.equal(
            lens(recipe).get(["ingredients", 0]),
            recipe["ingredients"][0]
        );

        // note that the first two test that .get returns the exact same
        // object. that's also true here, but I wanted to show more concretely
        // what's returned.

        assert.equal(
            lens(recipe).get(["ingredients", 0, "name"]),
            "chocolate"
        );

        assert.equal(
            lens(recipe).get(["ingredients", 0, "name", 5]),
            "l"
        );
    });
});

describe("set", function() {
    it("should set the specified focus", function() {
        var result = lens(recipe)
            .set(["ingredients"], "none!")
            .get(["ingredients"]);
        // var result1 = lens(recipe).set(["ingredients"], "none!");
        // var result = lens(result1).get(["ingredients"]);
        assert.equal(result, "none!");
    });

    it("should not modify the original object", function() {
        lens(recipe).set(["ingredients"], null).freeze();
        assert.deepEqual(
            recipe.ingredients,
            [
                {
                    name: "chocolate",
                    quantity: "1 cup"
                }
            ]
        );
    });

    it("should allow multiple sets on an array", function() {
        var arr = [1,2,3];
        var res = lens(arr)
            .set([0], 0)
            .set([1], 1)
            .set([2], 2)
            .freeze()

        assert.deepEqual(res, [0, 1, 2]);
    });
});

describe("del", function() {
    it("should remove the specified focus", function() {
        var result = lens(recipe).del(["ingredients"]).freeze();
        var expected = {
            steps: [
                "unwrap chocolate",
                "eat chocolate"
            ]
        };
        assert.deepEqual(result, expected);

        result = lens(recipe)
            .del(["steps", 0])
            .get(["steps"]);

        expected = ["unwrap chocolate", "eat chocolate"];
        expected.splice(0, 1);

        assert.deepEqual(result, expected);

        var result = lens({
            itemData: "",
            authorNames: ["joel", "alice"],
        }).del(["authorNames", 1])
            .freeze();

        assert.deepEqual(result, {
            itemData: "",
            authorNames: ["joel"],
        });
    });
});

describe("merge", function() {
    it("should merge in new properties", function() {
        var result = lens(recipe).merge(["ingredients", 0], {
            details: "dark, close to 72% cacao"
        }).get(["ingredients", 0]);

        var expected = {
            name: "chocolate",
            quantity: "1 cup",
            details: "dark, close to 72% cacao"
        };

        assert.deepEqual(result, expected);
    });

    it("should overwrite properties", function() {
        var result = lens(recipe).merge(["ingredients", 0], {
            name: "dark chocolate"
        }).get(["ingredients", 0]);

        var expected = {
            name: "dark chocolate",
            quantity: "1 cup"
        };

        assert.deepEqual(result, expected);
    });
});

describe("mod", function() {
    it("should not modify the original object", function() {
        lens(recipe).mod(["ingredients"], function(ingredients) {
            return ingredients.length;
        }).freeze();

        assert.deepEqual(
            recipe.ingredients,
            [
                {
                    name: "chocolate",
                    quantity: "1 cup"
                }
            ]
        );
    });
});

describe("zoom", function() {
    it("should focus on part of the structure", function() {
        var result = lens(recipe)
            .zoom(["ingredients", 0])
                .set(["name"], "chocolate chips")
                .set(["quantity"], "1 1/2 cups")
            .deZoom()
            .get(["ingredients", 0]);

        assert.deepEqual(result, {
            name: "chocolate chips",
            quantity: "1 1/2 cups"
        });
    });

    it("should allow nested zooms", function() {
        var result = lens(recipe)
            .zoom(["ingredients"])
                .zoom([0])
                    .set(["name"], "chocolate chips")
                    .set(["quantity"], "1 1/2 cups")
                .deZoom()
            .deZoom()
            .get(["ingredients", 0]);

        assert.deepEqual(result, {
            name: "chocolate chips",
            quantity: "1 1/2 cups"
        });
    });
});
