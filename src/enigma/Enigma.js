import { Rotor } from './Rotor.js';
import { Reflector } from './Reflector.js';
import { Plugboard } from './Plugboard.js';

/**
 * A three-rotor Enigma machine.
 *
 * The Java original has two constructors; here `fromKey` stands in for the
 * `Enigma(EnigmaKey)` overload.
 */
export class Enigma {
  // 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25
  // A B C D E F G H I J K  L  M  N  O  P  Q  R  S  T  U  V  W  X  Y  Z
  constructor(rotors, reflector, rotorPositions, ringSettings, plugboardConnections) {
    this.leftRotor = Rotor.create(rotors[0], rotorPositions[0], ringSettings[0]);
    this.middleRotor = Rotor.create(rotors[1], rotorPositions[1], ringSettings[1]);
    this.rightRotor = Rotor.create(rotors[2], rotorPositions[2], ringSettings[2]);
    this.reflector = Reflector.create(reflector);
    this.plugboard = new Plugboard(plugboardConnections);
  }

  /** Equivalent of Java's `Enigma(EnigmaKey key)` constructor. */
  static fromKey(key) {
    return new Enigma(key.rotors, 'B', key.indicators, key.rings, key.plugboard);
  }

  rotate() {
    // If middle rotor notch - double-stepping
    if (this.middleRotor.isAtNotch()) {
      this.middleRotor.turnover();
      this.leftRotor.turnover();
    }
    // If left-rotor notch
    else if (this.rightRotor.isAtNotch()) {
      this.middleRotor.turnover();
    }

    // Increment right-most rotor
    this.rightRotor.turnover();
  }

  /** Encrypts a single letter given as 0-25. */
  encrypt(c) {
    this.rotate();

    // Plugboard in
    c = this.plugboard.forward(c);

    // Right to left
    const c1 = this.rightRotor.forward(c);
    const c2 = this.middleRotor.forward(c1);
    const c3 = this.leftRotor.forward(c2);

    // Reflector
    const c4 = this.reflector.forward(c3);

    // Left to right
    const c5 = this.leftRotor.backward(c4);
    const c6 = this.middleRotor.backward(c5);
    let c7 = this.rightRotor.backward(c6);

    // Plugboard out
    c7 = this.plugboard.forward(c7);

    return c7;
  }

  /** Encrypts a string of A-Z and returns the ciphertext string. */
  encryptString(input) {
    let output = '';
    for (let i = 0; i < input.length; i++) {
      output += String.fromCharCode(this.encrypt(input.charCodeAt(i) - 65) + 65);
    }
    return output;
  }
}
