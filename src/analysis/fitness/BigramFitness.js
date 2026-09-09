import { FitnessFunction } from './FitnessFunction.js';
import { readNgramFile } from './ngramData.js';

function biIndex(a, b) {
  return (a << 5) | b;
}

/** Scores text by the log-probability of its letter pairs. */
export class BigramFitness extends FitnessFunction {
  constructor() {
    super();

    this.bigrams = new Array(826).fill(Math.fround(Math.log10(this.epsilon)));

    const rows = readNgramFile('bigrams');
    if (rows === null) {
      this.bigrams = null;
      return;
    }

    for (const s of rows) {
      const key = s[0];
      const i = biIndex(key.charCodeAt(0) - 65, key.charCodeAt(1) - 65);
      this.bigrams[i] = Math.fround(parseFloat(s[1]));
    }
  }

  score(text) {
    if (text.length === 0) {
      throw new RangeError('Index 0 out of bounds for length 0');
    }
    let fitness = 0;
    let current = 0;
    let next = text.charCodeAt(0) - 65;
    for (let i = 1; i < text.length; i++) {
      current = next;
      next = text.charCodeAt(i) - 65;
      fitness = Math.fround(fitness + this.bigrams[biIndex(current, next)]);
    }
    return fitness;
  }
}
