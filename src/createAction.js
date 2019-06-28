import scope from "./scope";
import { addToSet, notify, removeFromSet } from "./utils";
import createAccessor from "./createAccessor";
import configure from "./configs";

export default function createAction(states, functor, { name } = {}) {
  const accessorBag = [];
  const subscribers = {};
  let action;
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
    action.value--;
    notify(subscribers);
  }

  function unsubscribe(subscriber) {
    removeFromSet(subscribers, subscriber);
    return this;
  }

  function subscribe(subscriber) {
    addToSet(subscribers, subscriber);
    return this;
  }

  return (action = Object.assign(
    (...args) => {
      return scope(enqueue => {
        action.value++;
        enqueue(performUpdate);
        notify(subscribers);
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
                setTimeout(performUpdate);
                return payload;
              },
              error => {
                onDispatched();
                setTimeout(performUpdate);
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
      type: "action",
      computed: true,
      async: true,
      value: 0,
      init: () => {},
      subscribe,
      unsubscribe,
      getStates() {
        return states;
      },
      setStates(newStates) {
        accessors = (states = newStates).map(state =>
          createAccessor(state, accessorBag)
        );
      }
    }
  ));
}
