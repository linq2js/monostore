import { configs } from "./configs";
import scope from "./scope";
import { addToSet, notify, removeFromSet } from "./utils";
import createAccessor from "./createAccessor";

export default function createAction(states, functor, options) {
  if (typeof states === "function") {
    options = functor;
    functor = states;
    states = [];
  }

  const { name, debounce = 0 } = options || {};
  const accessorBag = [];
  const subscribers = {};
  let action;
  let timerId;
  let accessors = states.map(state => createAccessor(state, accessorBag));

  function performUpdate(subscribers = {}, batchUpdate) {
    while (accessorBag.length) {
      const accessor = accessorBag.shift();
      if (accessor.changed) {
        accessor.changed = false;
        Object.assign(subscribers, accessor.state.subscribers);
        let parent = accessor.state.parent;
        // notify to all ancestors
        while (parent) {
          Object.assign(subscribers, parent.subscribers);
          parent = parent.parent;
        }
      }
    }
    if (!batchUpdate) {
      notify(subscribers);
    }
  }

  function onDispatched() {
    configs.onActionDispatched({
      states,
      action: functor
    });
    action.value--;
    notify(subscribers, action);
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
      const execute = () => {
        clearTimeout(timerId);

        return scope(enqueue => {
          action.value++;
          action.times++;
          delete action.result;
          action.done = false;
          enqueue(performUpdate);
          notify(subscribers, action);
          let isAsyncAction = false;
          try {
            configs.onActionDispatching({
              states,
              action: functor
            });
            const result = functor(...accessors, ...args);

            if (result && result.then) {
              isAsyncAction = true;
              return result.then(
                payload => {
                  action.result = payload;
                  action.done = true;
                  onDispatched();
                  setTimeout(performUpdate);
                  return payload;
                },
                error => {
                  action.done = true;
                  onDispatched(error);
                  setTimeout(performUpdate);
                  return error;
                }
              );
            }

            action.result = result;
            action.done = true;

            return result;
          } finally {
            if (!isAsyncAction) {
              onDispatched();
            }
          }
        });
      };

      if (!debounce) return execute();
      clearTimeout(timerId);
      timerId = setTimeout(execute, debounce);
    },
    {
      $name: name,
      done: false,
      type: "action",
      times: 0,
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
