import { deepEqual } from "../utils";

test("should compare primitive values in array properly", () => {
  expect(deepEqual([], [1, 2, 3], [1, 2, 3])).toBe(true);
  expect(deepEqual([], [1, 2, 3], [1, 2, 2])).toBe(false);
});

test("should compare plain object in array properly", () => {
  expect(
    deepEqual(
      ["name", "age"],
      [{ name: "peter", age: 20 }, { name: "marry", age: 21 }],
      [{ name: "peter", age: 20 }, { name: "marry", age: 21 }]
    )
  ).toBe(true);
  expect(
    deepEqual(
      ["name", "age"],
      [{ name: "peter", age: 20 }, { name: "marry", age: 21 }],
      [{ name: "peter2", age: 20 }, { name: "marry", age: 21 }]
    )
  ).toBe(false);
});

test("should compare object properly", () => {
  expect(
    deepEqual(
      ["name", "age"],
      { name: "linq2js", age: 100, extraProp: 1 },
      { name: "linq2js", age: 100 }
    )
  ).toBe(true);
  expect(
    deepEqual(
      ["name", "age"],
      { name: "linq2js", age: 100, extraProp: 1 },
      { name: "linq2js", age: 99 }
    )
  ).toBe(false);
});

test("should compare nested object properly", () => {
  expect(
    deepEqual(
      ["name", "age", ["address", ["street"]]],
      {
        name: "linq2js",
        age: 100,
        address: { street: "abc", district: 100 },
        extraProp: 1
      },
      { name: "linq2js", age: 100, address: { street: "abc" } }
    )
  ).toBe(true);

  expect(
    deepEqual(
      ["name", "age", ["address", ["street", "district"]]],
      {
        name: "linq2js",
        age: 100,
        address: { street: "abc", district: 100 },
        extraProp: 1
      },
      { name: "linq2js", age: 100, address: { street: "abc" } }
    )
  ).toBe(false);
});
