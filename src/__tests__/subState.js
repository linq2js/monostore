import { createState, createAction } from "../index";

test("Object - Parent state value should be updated if any its sub state changed, using direct update", () => {
  const defaultParentStateValue = {};
  const parentState = createState(defaultParentStateValue);

  const subState1 = parentState.get("name");
  const subState2 = parentState.get("age");

  subState1("Peter");
  subState2(20);

  expect(subState1.value).toBe("Peter");
  expect(subState2.value).toBe(20);
  expect(parentState.value).not.toBe(defaultParentStateValue);
  expect(parentState.value).toEqual({
    name: "Peter",
    age: 20
  });
});

test("Array - Parent state value should be updated if any its sub state changed, using direct update", () => {
  const defaultParentStateValue = [];
  const parentState = createState(defaultParentStateValue);

  const subState1 = parentState.get(1);
  const subState2 = parentState.get(2);

  subState1("Peter");
  subState2(20);

  expect(subState1.value).toBe("Peter");
  expect(subState2.value).toBe(20);
  expect(parentState.value).not.toBe(defaultParentStateValue);
  expect(parentState.value).toEqual([undefined, "Peter", 20]);
});

test("Object - Parent state value should be updated if any its sub state changed, using action", () => {
  const defaultParentStateValue = {};
  const parentState = createState(defaultParentStateValue);

  const subState1 = parentState.get("name");
  const subState2 = parentState.get("age");

  const action = createAction(
    [subState1, subState2],
    (subState1, subState2) => {
      subState1("Peter");
      subState2(20);
    }
  );

  action();

  expect(subState1.value).toBe("Peter");
  expect(subState2.value).toBe(20);
  expect(parentState.value).not.toBe(defaultParentStateValue);
  expect(parentState.value).toEqual({
    name: "Peter",
    age: 20
  });
});

test("Array - Parent state value should be updated if any its sub state changed, using action", () => {
  const defaultParentStateValue = [];
  const parentState = createState(defaultParentStateValue);

  const subState1 = parentState.get(1);
  const subState2 = parentState.get(2);

  const action = createAction(
    [subState1, subState2],
    (subState1, subState2) => {
      subState1("Peter");
      subState2(20);
    }
  );

  action();

  expect(subState1.value).toBe("Peter");
  expect(subState2.value).toBe(20);
  expect(parentState.value).not.toBe(defaultParentStateValue);
  expect(parentState.value).toEqual([undefined, "Peter", 20]);
});
