var assert = require("chai").assert;
var lens = require("../lens.js");

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
            .setC(["ingredients"], "none!")
            .get(["ingredients"]);
        // var result1 = lens(recipe).set(["ingredients"], "none!");
        // var result = lens(result1).get(["ingredients"]);
        assert.equal(result, "none!");
    });

    it("should not modify the original object", function() {
        lens(recipe).set(["ingredients"], null);
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

describe("del", function() {
    it("should remove the specified focus", function() {
        var result = lens(recipe).del(["ingredients"]);
        var expected = {
            steps: [
                "unwrap chocolate",
                "eat chocolate"
            ]
        };
        assert.deepEqual(result, expected);

        result = lens(recipe)
            .delC(["steps", 0])
            .get(["steps"]);

        expected = ["unwrap chocolate", "eat chocolate"];
        delete expected[0];

        assert.deepEqual(result, expected);
    });
});

describe("merge", function() {
    it("should merge in new properties", function() {
        var result = lens(recipe).mergeC(["ingredients", 0], {
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
        var result = lens(recipe).mergeC(["ingredients", 0], {
            name: "dark chocolate"
        }).get(["ingredients", 0]);

        var expected = {
            name: "dark chocolate",
            quantity: "1 cup"
        };

        assert.deepEqual(result, expected);
    });
});