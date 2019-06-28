/**
 * update multiple states from specific data
 * @param stateMap
 * @param data
 */
export default function updateStates(stateMap, data = {}) {
  Object.keys(stateMap).forEach(key => {
    // do not overwrite state value if the key is not present in data
    if (!(key in data)) return;
    const state = stateMap[key];
    if (state.computed) {
      throw new Error("Cannot update computed state");
    }
    state(data[key]);
  });
}
