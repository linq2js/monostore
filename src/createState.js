import createAction from "./createAction";
import {
  removeFromSet,
  addToSet,
  notify,
  arrayDiff,
  updateAncestorStates
} from "./utils";
import getStateValues from "./getStateValues";
import configure from "./configs";

const noop = () => {};

export default function createState(...args) {
  const subscribers = {};

  function unsubscribe(subscriber) {
    removeFromSet(subscribers, subscriber);
    return this;
  }

  function subscribe(subscriber) {
    addToSet(subscribers, subscriber);
    return this;
  }

  let state;

  function getValue(callback, currentValue) {
    let newValue;
    // is normal object
    if (typeof callback !== "function") {
      newValue =
        // is synthetic event object
        callback && callback.target
          ? callback.target.type === "checkbox" ||
            callback.target.type === "radio"
            ? callback.target.checked // checkbox
            : callback.target.value // other inputs
          : callback;
    } else {
      newValue = callback(currentValue);
    }

    if (newValue && newValue.then) {
      throw new Error("Do not use this method for async updating");
    }

    return newValue;
  }

  function accessor(callback) {
    if (!arguments.length) return state.value;

    if (state.computed) {
      throw new Error("Cannot update computed state");
    }

    const newValue = getValue(callback, state.value);

    if (newValue !== state.value) {
      state.value = newValue;
      const ancestorSubscribers = updateAncestorStates(state, true);
      configure().onStateChanged(state);
      notify({
        ...ancestorSubscribers,
        ...subscribers
      });
    }
  }

  // create simple state
  if (typeof args[1] !== "function") {
    const subStates = {};
    const { name } = args[1] || {};
    return (state = Object.assign(accessor, {
      $name: name,
      value: args[0],
      done: true,
      subscribers,
      async: false,
      computed: false,
      merge(value) {
        state({
          ...state.value,
          value
        });
      },
      init: noop,
      subscribe,
      unsubscribe,
      // get sub state by name
      get(subStateName) {
        state.multiple = true;
        let subState = subStates[subStateName];

        if (!subState) {
          subStates[subStateName] = subState = createState(
            state.value ? state.value[subStateName] : undefined
          );
          subState.key = subStateName;
          subState.parent = state;
        }
        return subState;
      },
      // delete sub state by name
      delete(subStateName) {
        delete subStates[subStateName];
        return this;
      },
      invoke(actionBody, ...args) {
        return createAction([state], actionBody)(...args);
      }
    }));
  }

  // create computed state
  const [
    dependencies,
    loader,
    {
      name = loader.name,
      async = true,
      lazy = false,
      defaultValue = undefined,
      debounce = configure().debounce
    } = {}
  ] = args;

  let currentLock;
  let keys = [];
  let timerId;
  let init = async ? debouncedCallLoader : callLoaderSync;
  let allDone = dependencies.every(x => {
    x.init();
    x.subscribe(init);
    return x.done;
  });
  state = Object.assign(accessor, {
    $name: name,
    dependencies,
    value: defaultValue,
    done: false,
    async,
    lazy,
    computed: true,
    init,
    subscribers,
    subscribe,
    unsubscribe
  });

  const asyncDependencies = dependencies.filter(x => x.async);

  function debouncedCallLoader() {
    state.init = noop;

    // make sure all async states should be done
    if (asyncDependencies.some(x => !x.done)) return;
    // this state is called from another async state so we skip debouncing
    if (debounce) {
      clearTimeout(timerId);
      currentLock = state.lock = {};
      timerId = setTimeout(callLoaderAsync, debounce);
    } else {
      callLoaderAsync();
    }
  }

  function shouldUpdate(callback) {
    const newKeys = getStateValues(dependencies, true);

    if (arrayDiff(keys, newKeys)) {
      keys = newKeys;
      callback();
    }
  }

  function callLoaderSync() {
    state.init = noop;
    shouldUpdate(() => {
      state.done = false;
      const prevValue = state.value;
      state.value = loader(...keys);
      state.done = true;
      if (state.value !== prevValue) {
        notify(subscribers);
      }
    });
  }

  function callLoaderAsync() {
    clearTimeout(timerId);
    if (currentLock !== state.lock) return;
    shouldUpdate(async () => {
      const shouldNotify = state.done !== false || state.error;

      state.done = false;
      state.error = undefined;

      const originalValue = state.value;

      if (shouldNotify) {
        notify(subscribers);
      }

      try {
        const value = await loader(...keys);
        if (currentLock !== state.lock) return;

        if (value !== configure().noChange) {
          state.value = value;
        }

        state.done = true;
      } catch (e) {
        if (currentLock !== state.lock) return;
        state.error = e;
        state.done = true;
      }

      // dispatch change
      if (state.value !== originalValue) {
        notify(subscribers, state);
      }
    });
  }

  if (allDone) {
    if (state.async) {
      if (!state.lazy) {
        state.init();
      }
    } else {
      state.init();
    }
  }

  return state;
}
