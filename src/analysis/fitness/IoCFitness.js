import { FitnessFunction } from './FitnessFunction.js';

/**
 * Index of coincidence: how unevenly letters are distributed. English text
 * scores around 0.067, random text around 0.038.
 */
export class IoCFitness extends FitnessFunction {
  score(text) {
    const histogram = new Array(26).fill(0);
    for (let i = 0; i < text.length; i++) {
      histogram[text.charCodeAt(i) - 65]++;
    }

    const n = text.length;
    let total = 0;

    for (const v of histogram) {
      total = Math.fround(total + v * (v - 1));
    }

    return Math.fround(total / (n * (n - 1)));
  }
}
