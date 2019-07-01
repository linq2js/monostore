import { createAction, createState } from "../index";

test("date.day helper", () => {
  const state = createState(new Date("2019-01-01"));
  const action = createAction([state], state => state.add(1, "day"));
  action();
  expect(state.value.getDate()).toBe(2);
});

test("date.year helper", () => {
  const state = createState(new Date("2019-01-01"));
  const action = createAction([state], state => state.add(2, "year"));
  action();
  expect(state.value.getFullYear()).toBe(2021);
});

test("boolean helper", () => {
  const state = createState(true);
  const action = createAction([state], state => state.toggle());
  action();
  expect(state.value).toBe(false);
  action();
  expect(state.value).toBe(true);
});

test("number helper", () => {
  const state = createState(1);
  const action = createAction([state], state => state.add(1));
  action();
  expect(state.value).toBe(2);
});

test("modify nested props using prop()", () => {
  const originalValue = {
    person: {
      name: "linq2js",
      age: 30,
      address: {
        street: "abc"
      }
    },
    otherProp: {}
  };
  const state = createState(originalValue);
  const action = createAction([state], state => {
    state.prop("person").set("name", "linq2js-updated");
    // set default value for prop then modify it
    state
      .prop("test")
      .def({ data: true })
      .set("data", false);
    state
      .prop("person")
      .prop("age")
      .add(10);
    state
      .prop("person")
      .prop("address")
      .set("street", "def");
  });

  action();
  expect(state.value.otherProp).toBe(originalValue.otherProp);
  expect(state.value).not.toBe(originalValue);
  expect(state.value).toEqual({
    test: { data: false },
    person: {
      name: "linq2js-updated",
      age: 40,
      address: {
        street: "def"
      }
    },
    otherProp: {}
  });
});

test("keep helper should work properly with object and array", () => {
  const arrayState = createState([1, 2, 3, 4, 5]);
  const objectState = createState({ prop1: 1, prop2: 2, prop3: 3 });

  const action = createAction([arrayState, objectState], (array, object) => {
    array.keep(1, 3);
    object.keep("prop1", "prop3");
  });

  action();

  expect(arrayState.value).toEqual([2, 4]);
  expect(objectState.value).toEqual({ prop1: 1, prop3: 3 });
});

test("omit helper should work properly with object and array", () => {
  const arrayState = createState([1, 2, 3, 4, 5]);
  const objectState = createState({ prop1: 1, prop2: 2, prop3: 3 });

  const action = createAction([arrayState, objectState], (array, object) => {
    array.omit(1, 3);
    object.omit("prop1", "prop3");
  });

  action();

  expect(arrayState.value).toEqual([1, 3, 5]);
  expect(objectState.value).toEqual({ prop2: 2 });
});
