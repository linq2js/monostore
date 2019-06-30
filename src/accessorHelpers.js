import { cloneObject } from "./utils";
import dateModifiers from "./dateModifiers";
import arrayHelpers from "./arrayHelpers";
import objectHelpers from "./objectHelpers";

export default {
  ...arrayHelpers,
  ...objectHelpers,
  toggle(prop) {
    if (!arguments.length) {
      return this(!this.state.value);
    }
    const newValue = cloneObject(this.state.value);
    newValue[prop] = !newValue[prop];
    return this(newValue);
  },
  div(value) {
    return this(this.state.value / value);
  },
  mul(value) {
    return this(this.state.value * value);
  },
  add(value, duration = "day") {
    const originalValue = this.state.value;
    if (originalValue instanceof Date) {
      if (duration in dateModifiers) {
        return this(dateModifiers[duration](originalValue, value));
      }
      throw new Error("Invalid date duration " + duration);
    }
    return this(this.state.value + value);
  },
  replace(searchValue, replaceWith) {
    return this(this.state.value.replace(searchValue, replaceWith));
  },
  tap(callback) {
    const originalValue = this.state.value;
    return this(callback(originalValue));
  },
  def(defaultValue) {
    if (typeof this.state.value === "undefined" || this.state.value === null) {
      return this(defaultValue);
    }
    return this;
  },
  prop(prop) {
    return createPropProxy(this, prop, {
      currentValue: this.state.value,
      originalValue: this.state.value
    });
  }
};

function createPropProxy(obj, prop, context) {
  let propValue = context.currentValue[prop];

  const modifier = nextPropValue => {
    if (propValue === nextPropValue) {
      return modifier;
    }
    if (context.currentValue === context.originalValue) {
      context.currentValue = cloneObject(context.currentValue);
      obj(context.currentValue);
    }

    context.currentValue[prop] = propValue = nextPropValue;

    return modifier;
  };
  modifier.originalTarget = obj.originalTarget || obj;
  modifier.state = { value: propValue };
  const proxy = new Proxy(modifier, {
    get(target, name) {
      if (name === "get" || name === "delete") {
        throw new Error("Not support sub state for this prop " + prop);
      }
      const method = modifier.originalTarget[name];
      if (typeof method !== "function") {
        throw new Error("Invalid method " + name);
      }

      return (...args) => {
        modifier.state.value = propValue;
        const result = method.apply(modifier, args);
        return result === modifier ? proxy : result;
      };
    }
  });

  return proxy;
}
