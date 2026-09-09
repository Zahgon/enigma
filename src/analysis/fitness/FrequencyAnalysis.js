/** Accumulates letter counts across samples and reports relative frequencies. */
export class FrequencyAnalysis {
  constructor() {
    this.total = 0;
    this.counts = new Array(26).fill(0);
  }

  /** `text` is an array of letter indices (0-25). */
  analyse(text) {
    for (const b of text) {
      this.counts[b]++;
    }
    this.total += text.length;
  }

  frequencies() {
    const freq = new Array(26).fill(0);
    for (let i = 0; i < freq.length; i++) {
      freq[i] = Math.fround(this.counts[i] / this.total);
    }
    return freq;
  }
}
