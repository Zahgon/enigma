/**
 * The plugboard (Steckerbrett) swaps pairs of letters before and after the
 * rotor stack. Malformed or conflicting wiring degrades to identity; a letter
 * outside A-Z is rejected, matching the original's fixed-size array bounds.
 */

function splitLetters(connections) {
  const parts = connections.split(/[^a-zA-Z]/);
  while (parts.length > 0 && parts[parts.length - 1] === '') {
    parts.pop();
  }
  return parts;
}

export class Plugboard {
  constructor(connections) {
    this.wiring = Plugboard.decodePlugboard(connections);
  }

  forward(c) {
    if (c < 0 || c >= this.wiring.length) {
      throw new RangeError('Index ' + c + ' out of bounds for length ' + this.wiring.length);
    }
    return this.wiring[c];
  }

  static identityPlugboard() {
    const mapping = new Array(26);
    for (let i = 0; i < 26; i++) {
      mapping[i] = i;
    }
    return mapping;
  }

  /** Letters (as 0-25) with no plug attached, i.e. still available. */
  static getUnpluggedCharacters(plugboard) {
    const unpluggedCharacters = new Set();
    for (let i = 0; i < 26; i++) {
      unpluggedCharacters.add(i);
    }

    if (plugboard === '') {
      return unpluggedCharacters;
    }

    const pairings = splitLetters(plugboard);

    for (const pair of pairings) {
      const c1 = pair.charCodeAt(0) - 65;
      const c2 = pair.charCodeAt(1) - 65;

      unpluggedCharacters.delete(c1);
      unpluggedCharacters.delete(c2);
    }

    return unpluggedCharacters;
  }

  static decodePlugboard(plugboard) {
    if (plugboard === null || plugboard === undefined || plugboard === '') {
      return Plugboard.identityPlugboard();
    }

    const pairings = splitLetters(plugboard);
    const pluggedCharacters = new Set();
    const mapping = Plugboard.identityPlugboard();

    for (const pair of pairings) {
      if (pair.length !== 2) return Plugboard.identityPlugboard();

      const c1 = pair.charCodeAt(0) - 65;
      const c2 = pair.charCodeAt(1) - 65;

      if (pluggedCharacters.has(c1) || pluggedCharacters.has(c2)) {
        return Plugboard.identityPlugboard();
      }

      pluggedCharacters.add(c1);
      pluggedCharacters.add(c2);

      if (c1 < 0 || c1 >= mapping.length) {
        throw new RangeError('Index ' + c1 + ' out of bounds for length ' + mapping.length);
      }
      if (c2 < 0 || c2 >= mapping.length) {
        throw new RangeError('Index ' + c2 + ' out of bounds for length ' + mapping.length);
      }

      mapping[c1] = c2;
      mapping[c2] = c1;
    }

    return mapping;
  }
}
