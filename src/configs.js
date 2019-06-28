import actionHelpers from "./actionStateHelpers";

const configs = {
  debounce: 50,
  helpers: actionHelpers,
  noChange: {},
  onStateChanged: () => {},
  onActionDispatching: () => {},
  onActionDispatched: () => {}
};

export default function configure(options = {}) {
  if (!arguments.length) return configs;
  if (typeof options === "function") {
    options = options(configs);
  }
  Object.assign(configs, options);
}
