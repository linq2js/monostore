import { updateAncestorStates } from "./utils";
import { configs } from "./configs";

export default function createAccessor(state, accessorBag) {
  const accessor = function(value, ...args) {
    if (arguments.length) {
      if (state.computed) {
        throw new Error("Cannot update computed state");
      }

      if (configs.transform) {
        value = configs.transform(state.value, value, ...args);
      } else if (typeof value === "function") {
        value = value(state.value);
      }

      if (state.value !== value) {
        state.value = value;
        accessorBag.push(accessor);
        updateAncestorStates(state);
        accessor.changed = true;
      }

      return accessor;
    }

    return state.value;
  };

  return Object.assign(accessor, {
    ...configs.helpers,
    state,
    changed: false,
    delete(subStateName) {
      this.state.delete(subStateName);
      return this;
    },
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
