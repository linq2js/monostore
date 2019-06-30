let setUniqueId = 1;
const idProp = "__id__";

export const cloneObject = obj => (Array.isArray(obj) ? [...obj] : { ...obj });

export function memoize(f) {
  let lastResult;
  let lastArgs;

  return function(...args) {
    // call f on first time or args changed
    if (!lastArgs || arrayEqual(lastArgs, args)) {
      lastArgs = args;
      lastResult = f(...lastArgs);
    }
    return lastResult;
  };
}

export function arrayEqual(a, b) {
  return a.length !== b.length || a.some((i, index) => i !== b[index]);
}

export function addToSet(set, functor) {
  if (!functor[idProp]) {
    functor[idProp] = setUniqueId++;
  }

  if (functor[idProp] in set) {
    return;
  }

  set[functor[idProp]] = functor;
}

export function removeFromSet(set, functor) {
  if (functor[idProp]) {
    delete set[functor[idProp]];
  }
}

export function notify(subscribers) {
  for (const key in subscribers) {
    if (!subscribers.hasOwnProperty(key)) {
      continue;
    }
    subscribers[key]();
  }
}

export function updateAncestorStates(state, collectSubscribers) {
  const result = {};
  let parent = state.parent;
  let value = state.value;
  while (parent) {
    parent.value = cloneObject(parent.value);
    parent.value[state.key] = value;
    if (collectSubscribers) {
      Object.assign(result, parent.subscribers);
    }
    value = parent.value;
    parent = parent.parent;
  }
}

export function deepEqual(props, a, b) {
  if (typeof a === "undefined" && typeof b === "undefined") return true;
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    // just compare items in both arrays
    if (!props.length) {
      return !a.some((i, index) => i !== b[index]);
    }
    return a.every((i, index) => deepEqual(props, i, b[index]));
  }
  if (a && b) {
    return props.every(prop => {
      if (Array.isArray(prop)) {
        return deepEqual(prop[1], a[prop[0]], b[prop[0]]);
      }
      return a[prop] === b[prop];
    });
  }
  return a === b;
}
