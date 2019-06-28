import scope from "./scope";
import { notify } from "./utils";
import createAccessor from "./createAccessor";

export default function createAction(states, functor) {
  const accessorBag = [];
  let accessors = states.map(state => createAccessor(state, accessorBag));

  function performUpdate(subscribers = {}, batchUpdate) {
    while (accessorBag.length) {
      const accessor = accessorBag.shift();
      if (accessor.changed) {
        Object.assign(subscribers, accessor.state.subscribers);
        let parent = accessor.state.parent;
        // notify to all ancestors
        while (parent) {
          Object.assign(subscribers, parent.subscribers);
          parent = parent.parent;
        }
        accessor.changed = false;
      }
    }
    if (!batchUpdate) {
      notify(subscribers);
    }
  }

  return Object.assign(
    (...args) => {
      return scope(enqueue => {
        enqueue(performUpdate);

        return functor(...accessors, ...args);
      });
    },
    {
      getStates() {
        return states;
      },
      setStates(newStates) {
        accessors = (states = newStates).map(state =>
          createAccessor(state, accessorBag)
        );
      }
    }
  );
}
