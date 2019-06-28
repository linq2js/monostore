import { updateAncestorStates } from "./utils";
import configure from "./configs";

export default function createAccessor(state, accessorBag) {
  const accessor = function(value, ...args) {
    if (arguments.length) {
      if (state.computed) {
        throw new Error("Cannot update computed state");
      }

      if (configure().transform) {
        value = configure().transform(state.value, value, ...args);
      } else if (typeof value === "function") {
        value = value(state.value);
      }

      if (state.value !== value) {
        state.value = value;
        updateAncestorStates(state);
        accessor.changed = true;
      }

      return accessor;
    }

    return state.value;
  };

  accessorBag.push(accessor);

  return Object.assign(accessor, {
    ...configure().helpers,
    state,
    changed: false,
    get(subStateName) {
      if (!this.subStates) {
        this.subStates = {};
      }
      if (!(subStateName in this.subStates)) {
        this.subStates[subStateName] = createAccessor(
          this.state.get(subStateName),
          accessorBag
        );
      }
      return this.subStates[subStateName];
    }
  });
}
