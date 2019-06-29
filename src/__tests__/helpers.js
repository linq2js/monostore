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

test("modify nested props", () => {
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
