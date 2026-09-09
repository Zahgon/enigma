import { FitnessFunction } from './FitnessFunction.js';
import { readNgramFile } from './ngramData.js';

function quadIndex(a, b, c, d) {
  return (a << 15) | (b << 10) | (c << 5) | d;
}

/** Scores text by the log-probability of its letter quadruples. */
export class QuadramFitness extends FitnessFunction {
  constructor() {
    super();

    this.quadgrams = new Array(845626).fill(Math.fround(Math.log10(this.epsilon)));

    const rows = readNgramFile('quadgrams');
    if (rows === null) {
      this.quadgrams = null;
      return;
    }

    for (const s of rows) {
      const key = s[0];
      const i = quadIndex(
        key.charCodeAt(0) - 65,
        key.charCodeAt(1) - 65,
        key.charCodeAt(2) - 65,
        key.charCodeAt(3) - 65,
      );
      this.quadgrams[i] = Math.fround(parseFloat(s[1]));
    }
  }

  score(text) {
    let fitness = 0;
    let current = 0;
    let next1 = text.charCodeAt(0) - 65;
    let next2 = text.charCodeAt(1) - 65;
    let next3 = text.charCodeAt(2) - 65;
    for (let i = 3; i < text.length; i++) {
      current = next1;
      next1 = next2;
      next2 = next3;
      next3 = text.charCodeAt(i) - 65;
      fitness = Math.fround(fitness + this.quadgrams[quadIndex(current, next1, next2, next3)]);
    }
    return fitness;
  }
}
