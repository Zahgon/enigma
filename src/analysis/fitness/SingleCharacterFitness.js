import { FitnessFunction } from './FitnessFunction.js';
import { readNgramFile } from './ngramData.js';

/** Scores text by the log-probability of its individual letters. */
export class SingleCharacterFitness extends FitnessFunction {
  constructor() {
    super();

    this.singles = new Array(26).fill(0);

    const rows = readNgramFile('single');
    if (rows === null) {
      this.singles = null;
      return;
    }

    for (const s of rows) {
      const i = s[0].charCodeAt(0) - 65;
      this.singles[i] = Math.fround(parseFloat(s[1]));
    }
  }

  score(text) {
    let fitness = 0;
    for (let i = 0; i < text.length; i++) {
      const idx = text.charCodeAt(i) - 65;
      if (idx < 0 || idx >= this.singles.length) {
        throw new RangeError('Index ' + idx + ' out of bounds for length ' + this.singles.length);
      }
      fitness = Math.fround(fitness + this.singles[idx]);
    }
    return fitness;
  }
}
