import { FitnessFunction } from './FitnessFunction.js';
import { readNgramFile } from './ngramData.js';

function triIndex(a, b, c) {
  return (a << 10) | (b << 5) | c;
}

/** Scores text by the log-probability of its letter triples. */
export class TrigramFitness extends FitnessFunction {
  constructor() {
    super();

    this.trigrams = new Array(26426).fill(Math.fround(Math.log10(this.epsilon)));

    const rows = readNgramFile('trigrams');
    if (rows === null) {
      this.trigrams = null;
      return;
    }

    for (const s of rows) {
      const key = s[0];
      const i = triIndex(key.charCodeAt(0) - 65, key.charCodeAt(1) - 65, key.charCodeAt(2) - 65);
      this.trigrams[i] = Math.fround(parseFloat(s[1]));
    }
  }

  score(text) {
    let fitness = 0;
    let current = 0;
    let next1 = text.charCodeAt(0) - 65;
    let next2 = text.charCodeAt(1) - 65;
    for (let i = 2; i < text.length; i++) {
      current = next1;
      next1 = next2;
      next2 = text.charCodeAt(i) - 65;
      fitness = Math.fround(fitness + this.trigrams[triIndex(current, next1, next2)]);
    }
    return fitness;
  }
}
