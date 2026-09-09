/**
 * A candidate Enigma configuration: which rotors, their start indicators,
 * their ring settings and the plugboard wiring.
 */
export class EnigmaKey {
  constructor(rotors, indicators, rings, plugboardConnections) {
    this.rotors = rotors == null ? ['I', 'II', 'III'] : rotors;
    this.indicators = indicators == null ? [0, 0, 0] : indicators;
    this.rings = rings == null ? [0, 0, 0] : rings;
    this.plugboard = plugboardConnections == null ? '' : plugboardConnections;
  }

  /** Equivalent of Java's `EnigmaKey(EnigmaKey key)` copy constructor. */
  static copy(key) {
    return new EnigmaKey(
      key.rotors == null ? ['I', 'II', 'III'] : [key.rotors[0], key.rotors[1], key.rotors[2]],
      key.indicators == null ? [0, 0, 0] : key.indicators.slice(0, 3),
      key.rings == null ? [0, 0, 0] : key.rings.slice(0, 3),
      key.plugboard == null ? '' : key.plugboard
    );
  }
}
