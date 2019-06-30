import { createAction } from "../index";

test("Should update action status when action dispatching and dispatched", () => {
  return new Promise(resolve => {
    const action = createAction(
      () => new Promise(resolve2 => setTimeout(() => resolve2(true), 50))
    );

    action();

    expect(action.value).toBe(1);
    expect(action.times).toBe(1);

    action();

    expect(action.value).toBe(2);
    expect(action.times).toBe(2);

    setTimeout(() => {
      expect(action.value).toBe(0);
      expect(action.times).toBe(2);
      expect(action.done).toBe(true);
      expect(action.result).toBe(true);
      resolve();
    }, 100);
  });
});
