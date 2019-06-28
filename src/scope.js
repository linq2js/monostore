import { notify } from "./utils";

let scopes = 0;
const updates = [];

export default function scope(callback) {
  try {
    scopes++;
    return callback(updater => updates.push(updater));
  } finally {
    scopes--;
    if (!scopes) {
      // collect all subscribers need to be notified
      const subscribers = {};
      updates
        .splice(0, updates.length)
        .forEach(update => update(subscribers, true));

      notify(subscribers);
    }
  }
}
