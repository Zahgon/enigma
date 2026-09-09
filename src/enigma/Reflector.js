/** The reflector (Umkehrwalze) sends the signal back through the rotors. */
export class Reflector {
  constructor(encoding) {
    this.forwardWiring = Reflector.decodeWiring(encoding);
  }

  static Create(name) {
    return Reflector.create(name);
  }

  static create(name) {
    switch (name) {
      case 'B':
        return new Reflector('YRUHQSLDPXNGOKMIEBFZCWVJAT');
      case 'C':
        return new Reflector('FVPJIAOYEDRZXWGCTKUQSBNMHL');
      default:
        return new Reflector('ZYXWVUTSRQPONMLKJIHGFEDCBA');
    }
  }

  static decodeWiring(encoding) {
    const wiring = new Array(encoding.length);
    for (let i = 0; i < encoding.length; i++) {
      wiring[i] = encoding.charCodeAt(i) - 65;
    }
    return wiring;
  }

  forward(c) {
    return this.forwardWiring[c];
  }
}
