export default {
  splice(index, count = 1, ...items) {
    return this(this.state.value.slice().splice(index, count, ...items));
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
  filterMap(predicate, mapper) {
    const result = [];
    this.state.value.forEach((value, index) => {
      if (predicate(value, index)) {
        result.push(mapper(value, index));
      }
    });
    return this(result);
  },
  reduce(...args) {
    return this(this.state.value.reduce(...args));
  },
  mapReduce(mapper, ...args) {
    return this(this.state.value.map(mapper).reduce(...args));
  },
  exclude(...values) {
    return this(this.state.value.filter(x => !values.includes(x)));
  },
  map(mapper) {
    return this(this.state.value.map(mapper));
  },
  sort(sorter) {
    return this(this.state.value.slice().sort(sorter));
  },
  clear() {
    return this(Array.isArray(this.state.value) ? [] : {});
  },
  orderBy(selector, desc) {
    return this.sort((a, b) => {
      const aValue = selector(a),
        bValue = selector(b);
      return (
        (aValue === bValue ? 0 : aValue > bValue ? 1 : -1) * (desc ? -1 : 1)
      );
    });
  }
};
