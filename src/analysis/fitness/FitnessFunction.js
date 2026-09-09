/**
 * Base class for the scoring functions used to rank candidate decryptions.
 */
export class FitnessFunction {
  constructor() {
    this.epsilon = Math.fround(3e-10);
  }

  // eslint-disable-next-line no-unused-vars
  score(text) {
    return 0;
  }
}
