import { FitnessFunction } from './FitnessFunction.js';

/**
 * Scores a decryption by how many characters it shares with a known (possibly
 * partial) plaintext - a crib.
 *
 * Positions holding a NUL character are treated as unknown.
 */
export class KnownPlaintextFitness extends FitnessFunction {
  constructor(plaintext) {
    super();
    this.plaintext = plaintext;
  }

  /** Builds a crib from words placed at the given offsets. */
  static fromWords(words, offsets) {
    let length = 0;
    for (let i = 0; i < words.length; i++) {
      const offset = offsets[i] + words[i].length;
      length = Math.max(offset, length);
    }

    const chars = new Array(length).fill('\0');

    for (let i = 0; i < words.length; i++) {
      for (let j = 0; j < words[i].length; j++) {
        chars[offsets[i] + j] = words[i][j];
      }
    }

    return new KnownPlaintextFitness(chars.join(''));
  }

  score(text) {
    const length = Math.min(this.plaintext.length, text.length);
    let total = 0;
    for (let i = 0; i < length; i++) {
      if (this.plaintext.charCodeAt(i) > 0) {
        total += this.plaintext[i] === text[i] ? 1 : 0;
      }
    }
    return total;
  }
}
