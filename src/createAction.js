import scope from "./scope";
import { notify } from "./utils";
import createAccessor from "./createAccessor";
import configure from "./configs";

export default function createAction(states, functor, { name } = {}) {
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

  function onDispatched() {
    configure().onActionDispatched({
      states,
      action: functor
    });
  }

  return Object.assign(
    (...args) => {
      return scope(enqueue => {
        enqueue(performUpdate);
        let isAsyncAction = false;
        try {
          configure().onActionDispatching({
            states,
            action: functor
          });
          const result = functor(...accessors, ...args);

          if (result && result.then) {
            isAsyncAction = true;
            result.then(
              payload => {
                onDispatched();
                return payload;
              },
              error => {
                onDispatched();
                return error;
              }
            );
          }

          return result;
        } finally {
          if (!isAsyncAction) {
            onDispatched();
          }
        }
      });
    },
    {
      $name: name,
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
