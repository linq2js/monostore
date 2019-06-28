/**
 * export multiple states to json object
 * @param stateMap
 */
export default function exportStates(stateMap) {
  const values = {};

  Object.keys(stateMap).forEach(key => {
    values[key] = stateMap[key]();
  });

  return values;
}
