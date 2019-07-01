import actionHelpers from "monostore/src/accessorHelpers";

export const configs = {
  debounce: 50,
  helpers: actionHelpers,
  onStateChanged: () => {},
  onActionDispatching: () => {},
  onActionDispatched: () => {}
};

export default function configure(options = {}) {
  if (typeof options === "function") {
    options = options(configs);
  }
  Object.assign(configs, options);
}
