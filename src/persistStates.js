import configure from "./configs";
import exportStates from "./exportStates";
import updateStates from "./updateStates";

/**
 * perform loading/saving multiple states automatically
 * @param states
 * @param data
 * @param onChange
 * @param debounce
 */
export default function persistStates(
  states,
  data,
  onChange,
  debounce = configure().debounce
) {
  updateStates(states, data);
  let timerId;
  function debouncedHandleChange() {
    if (debounce) {
      clearTimeout(timerId);
      timerId = setTimeout(handleChange, debounce);
    } else {
      handleChange();
    }
  }

  function handleChange() {
    clearTimeout(timerId);
    const values = exportStates(states);
    onChange && onChange(values);
  }

  Object.values(states).forEach(state =>
    state.subscribe(debouncedHandleChange)
  );
}
