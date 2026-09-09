/**
 * A single Enigma rotor: a fixed wiring, a rotating position, a ring setting
 * and a notch that steps the rotor to its left.
 */
export class Rotor {
  constructor(name, encoding, rotorPosition, notchPosition, ringSetting) {
    this.name = name;
    this.forwardWiring = Rotor.decodeWiring(encoding);
    this.backwardWiring = Rotor.inverseWiring(this.forwardWiring);
    this.rotorPosition = rotorPosition;
    this.notchPosition = notchPosition;
    this.ringSetting = ringSetting;
  }

  static create(name, rotorPosition, ringSetting) {
    switch (name) {
      case 'I':
        return new Rotor('I', 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', rotorPosition, 16, ringSetting);
      case 'II':
        return new Rotor('II', 'AJDKSIRUXBLHWTMCQGZNPYFVOE', rotorPosition, 4, ringSetting);
      case 'III':
        return new Rotor('III', 'BDFHJLCPRTXVZNYEIWGAKMUSQO', rotorPosition, 21, ringSetting);
      case 'IV':
        return new Rotor('IV', 'ESOVPZJAYQUIRHXLNFTGKDCMWB', rotorPosition, 9, ringSetting);
      case 'V':
        return new Rotor('V', 'VZBRGITYUPSDNHLXAWMJQOFECK', rotorPosition, 25, ringSetting);
      // Rotors VI, VII and VIII each have two notches, so they override
      // isAtNotch rather than relying on a single notch position.
      case 'VI':
        return new TwoNotchRotor('VI', 'JPGVOUMFYQBENHZRDKASXLICTW', rotorPosition, ringSetting);
      case 'VII':
        return new TwoNotchRotor('VII', 'NZJHGRCXMYSWBOUFAIVLPEKQDT', rotorPosition, ringSetting);
      case 'VIII':
        return new TwoNotchRotor('VIII', 'FKQHTLXOCBJSPDZRAMEWNIUYGV', rotorPosition, ringSetting);
      default:
        return new Rotor('Identity', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', rotorPosition, 0, ringSetting);
    }
  }

  static Create(name, rotorPosition, ringSetting) {
    return Rotor.create(name, rotorPosition, ringSetting);
  }

  getName() {
    return this.name;
  }

  getPosition() {
    return this.rotorPosition;
  }

  static decodeWiring(encoding) {
    const wiring = new Array(encoding.length);
    for (let i = 0; i < encoding.length; i++) {
      wiring[i] = encoding.charCodeAt(i) - 65;
    }
    return wiring;
  }

  static inverseWiring(wiring) {
    const inverse = new Array(wiring.length);
    for (let i = 0; i < wiring.length; i++) {
      inverse[wiring[i]] = i;
    }
    return inverse;
  }

  static encipher(k, pos, ring, mapping) {
    const shift = pos - ring;
    return (mapping[(k + shift + 26) % 26] - shift + 26) % 26;
  }

  forward(c) {
    return Rotor.encipher(c, this.rotorPosition, this.ringSetting, this.forwardWiring);
  }

  backward(c) {
    return Rotor.encipher(c, this.rotorPosition, this.ringSetting, this.backwardWiring);
  }

  isAtNotch() {
    return this.notchPosition === this.rotorPosition;
  }

  turnover() {
    this.rotorPosition = (this.rotorPosition + 1) % 26;
  }
}

/** Rotors VI-VIII step at both M and Z. */
class TwoNotchRotor extends Rotor {
  constructor(name, encoding, rotorPosition, ringSetting) {
    super(name, encoding, rotorPosition, 0, ringSetting);
  }

  isAtNotch() {
    return this.rotorPosition === 12 || this.rotorPosition === 25;
  }
}
