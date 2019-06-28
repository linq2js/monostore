import { memoize } from "./utils";

export default function getStateValues(states, valueOnly) {
  return states.map(x => {
    if (x.type === "action") return x.value;
    const [state, mapper, ...mapperArgs] = Array.isArray(x) ? x : [x];
    state.init();
    const result = valueOnly ? state() : state.async ? state : state();
    if (mapper && !mapper.__memoizedMapper) {
      mapper.__memoizedMapper = memoize(mapper);
    }
    return mapper
      ? mapperArgs.length
        ? mapper.__memoizedMapper(result, ...mapperArgs)
        : mapper(result)
      : result;
  });
}
