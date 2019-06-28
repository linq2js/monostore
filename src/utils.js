let setUniqueId = 1;
const idProp = "__id__";

export const cloneObject = obj => (Array.isArray(obj) ? [...obj] : { ...obj });

export function memoize(f) {
  let lastResult;
  let lastArgs;

  return function(...args) {
    // call f on first time or args changed
    if (!lastArgs || arrayDiff(lastArgs, args)) {
      lastArgs = args;
      lastResult = f(...lastArgs);
    }
    return lastResult;
  };
}

export function arrayDiff(a, b) {
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
  for (const subscriber of Object.values(subscribers)) {
    subscriber();
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
