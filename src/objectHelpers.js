import { cloneObject } from "./utils";

export default {
  unset(...props) {
    const newValue = cloneObject(this.state.value);
    for (const prop of props) {
      delete newValue[prop];
    }
    return this(newValue);
  },

  set(prop, value) {
    const newValue = cloneObject(this.state.value);
    newValue[prop] =
      typeof value === "function" ? value(newValue[prop]) : value;
    return this(newValue);
  },

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

  keep(...props) {
    return this(createFrom(this.state.value, x => props.includes(x)));
  },
  omit(...props) {
    return this(createFrom(this.state.value, x => !props.includes(x)));
  }
};

function createFrom(source, filter) {
  if (Array.isArray(source)) {
    return source.filter((x, i) => filter(i));
  }
  return Object.keys(source)
    .filter(filter)
    .reduce((obj, key) => {
      obj[key] = source[key];
      return obj;
    }, {});
}
