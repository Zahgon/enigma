import { EnigmaKey } from './EnigmaKey.js';

/** An EnigmaKey paired with the fitness score that ranked it. */
export class ScoredEnigmaKey extends EnigmaKey {
  constructor(key, score) {
    const copy = EnigmaKey.copy(key);
    super(copy.rotors, copy.indicators, copy.rings, copy.plugboard);
    this.score = score;
  }

  getScore() {
    return this.score;
  }

  /** Ascending by score. */
  compareTo(other) {
    return this.score - other.score;
  }
}
