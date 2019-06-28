import { cloneObject } from "./utils";
import dateModifiers from "./dateModifiers";

export default {
  assign(...values) {
    const originalValue = this.state.value;
    return this(
      Object.assign(
        {},
        originalValue,
        ...values.map(value =>
          typeof value === "function" ? value(originalValue) : value
        )
      )
    );
  },
  splice(index, count = 1, ...items) {
    return this(this.state.value.slice().splice(index, count, ...items));
  },
  assignProp(prop, ...values) {
    const newValue = cloneObject(this.state.value);
    const propValue = newValue[prop];
    newValue[prop] = Object.assign(
      {},
      propValue,
      ...values.map(value =>
        typeof value === "function" ? value(propValue) : value
      )
    );
    return this(newValue);
  },
  push(...values) {
    return this(this.state.value.concat(values));
  },
  unshift(...values) {
    return this(values.concat(this.state.value));
  },
  filter(predicate) {
    return this(this.state.value.filter(predicate));
  },
  exclude(...values) {
    return this(this.state.value.filter(x => values.includes(x)));
  },
  unset(...props) {
    const newValue = cloneObject(this.state.value);
    for (const prop of props) {
      delete newValue[prop];
    }
    return this(newValue);
  },
  map(mapper) {
    return this(this.state.value.map(mapper));
  },
  set(prop, value) {
    const newValue = cloneObject(this.state.value);
    newValue[prop] =
      typeof value === "function" ? value(newValue[prop]) : value;
    return this(newValue);
  },
  sort(sorter) {
    return this(this.state.value.slice().sort(sorter));
  },
  orderBy(selector, desc) {
    return this.sort((a, b) => {
      const aValue = selector(a),
        bValue = selector(b);
      return (
        (aValue === bValue ? 0 : aValue > bValue ? 1 : -1) * (desc ? -1 : 1)
      );
    });
  },
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
  }
};
