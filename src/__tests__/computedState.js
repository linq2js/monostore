import { createState } from "../index";

test("sync computed state should work properly", () => {
  const baseValueState = createState(1);
  const doubleValueState = createState(
    [baseValueState],
    baseValue => baseValue * 2,
    { async: false }
  );
  expect(doubleValueState.value).toBe(2);
});

test("async computed state should work properly", async () => {
  const value = await new Promise(resolve => {
    const baseValueState = createState(1);
    const doubleValueState = createState(
      [baseValueState],
      baseValue => baseValue * 2,
      {
        lazy: false
      }
    );
    doubleValueState.subscribe(() => resolve(doubleValueState.value));
  });

  expect(value).toBe(2);
});

test("lazy computed state should start after init method called", async () => {
  return new Promise(resolve => {
    const baseValueState = createState(1);
    const doubleValueState = createState(
      [baseValueState],
      baseValue => baseValue * 2
    );
    let phase = 0;
    doubleValueState.subscribe(() => {
      expect(phase).toBe(2);
      resolve();
    });
    phase++;
    doubleValueState.init();
    phase++;
  });
});
