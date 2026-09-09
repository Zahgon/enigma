import { Enigma } from '../enigma/Enigma.js';
import { Plugboard } from '../enigma/Plugboard.js';
import { EnigmaKey } from './EnigmaKey.js';
import { ScoredEnigmaKey } from './ScoredEnigmaKey.js';

/** Which rotor set the analysis is allowed to draw from. */
export const AvailableRotors = Object.freeze({
  THREE: 'THREE',
  FIVE: 'FIVE',
  EIGHT: 'EIGHT',
});

const MIN_FITNESS = -1e30;

/**
 * Breaks an Enigma message in three stages: rotor order and start positions
 * first, then ring settings, then plugs one at a time. Each stage assumes the
 * previous one landed close enough for the next fitness function to see signal.
 */
export class EnigmaAnalysis {
  /**
   * Tries every rotor ordering and start position, returning the top
   * `requiredKeys` configurations by fitness.
   */
  static findRotorConfiguration(ciphertext, rotors, plugboard, requiredKeys, f) {
    let availableRotorList;

    switch (rotors) {
      case AvailableRotors.THREE:
        availableRotorList = ['I', 'II', 'III'];
        break;
      case AvailableRotors.FIVE:
        availableRotorList = ['I', 'II', 'III', 'IV', 'V'];
        break;
      case AvailableRotors.EIGHT:
      default:
        availableRotorList = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
        break;
    }

    const keySet = [];

    for (const rotor1 of availableRotorList) {
      for (const rotor2 of availableRotorList) {
        if (rotor1 === rotor2) continue;
        for (const rotor3 of availableRotorList) {
          if (rotor1 === rotor3 || rotor2 === rotor3) continue;
          console.log(`${rotor1} ${rotor2} ${rotor3}`);

          let maxFitness = MIN_FITNESS;
          let bestKey = null;
          for (let i = 0; i < 26; i++) {
            for (let j = 0; j < 26; j++) {
              for (let k = 0; k < 26; k++) {
                const e = new Enigma([rotor1, rotor2, rotor3], 'B', [i, j, k], [0, 0, 0], plugboard);
                const decryption = e.encryptString(ciphertext);
                const fitness = f.score(decryption);
                if (fitness > maxFitness) {
                  maxFitness = fitness;
                  const optimalRotors = [
                    e.leftRotor.getName(),
                    e.middleRotor.getName(),
                    e.rightRotor.getName(),
                  ];
                  bestKey = new EnigmaKey(optimalRotors, [i, j, k], null, plugboard);
                }
              }
            }
          }

          keySet.push(new ScoredEnigmaKey(bestKey, maxFitness));
        }
      }
    }

    // Sort keys by best performing (highest fitness score)
    keySet.sort((a, b) => b.score - a.score);
    return keySet.slice(0, requiredKeys);
  }

  /** Optimises the right and middle ring settings for an already-found key. */
  static findRingSettings(key, ciphertext, f) {
    const newKey = EnigmaKey.copy(key);

    const rightRotorIndex = 2;
    const middleRotorIndex = 1;

    // Optimise right rotor
    let optimalIndex = EnigmaAnalysis.findRingSetting(newKey, ciphertext, rightRotorIndex, f);
    newKey.rings[rightRotorIndex] = optimalIndex;
    newKey.indicators[rightRotorIndex] = (newKey.indicators[rightRotorIndex] + optimalIndex) % 26;

    // Optimise middle rotor
    optimalIndex = EnigmaAnalysis.findRingSetting(newKey, ciphertext, middleRotorIndex, f);
    newKey.rings[middleRotorIndex] = optimalIndex;
    newKey.indicators[middleRotorIndex] = (newKey.indicators[middleRotorIndex] + optimalIndex) % 26;

    // Calculate fitness and return scored key
    const e = Enigma.fromKey(newKey);
    const decryption = e.encryptString(ciphertext);
    return new ScoredEnigmaKey(newKey, f.score(decryption));
  }

  /** Finds the best ring setting for a single rotor, holding the others fixed. */
  static findRingSetting(key, ciphertext, rotor, f) {
    const rotors = key.rotors;
    const originalIndicators = key.indicators;
    const originalRingSettings = key.rings != null ? key.rings : [0, 0, 0];
    const plugboard = key.plugboard;
    let optimalRingSetting = 0;

    let maxFitness = MIN_FITNESS;
    for (let i = 0; i < 26; i++) {
      const currentStartingPositions = originalIndicators.slice(0, 3);
      const currentRingSettings = originalRingSettings.slice(0, 3);

      currentStartingPositions[rotor] = (currentStartingPositions[rotor] + i) % 26;
      currentRingSettings[rotor] = i;

      const e = new Enigma(rotors, 'B', currentStartingPositions, currentRingSettings, plugboard);
      const decryption = e.encryptString(ciphertext);
      const fitness = f.score(decryption);
      if (fitness > maxFitness) {
        maxFitness = fitness;
        optimalRingSetting = i;
      }
    }
    return optimalRingSetting;
  }

  /** Finds the single best additional plug to add to a key's plugboard. */
  static findPlug(key, ciphertext, f) {
    const unpluggedCharacters = Plugboard.getUnpluggedCharacters(key.plugboard);

    const currentKey = EnigmaKey.copy(key);
    const originalPlugs = currentKey.plugboard;
    let optimalPlugSetting = '';
    let maxFitness = MIN_FITNESS;
    for (const i of unpluggedCharacters) {
      for (const j of unpluggedCharacters) {
        if (i >= j) continue;

        const plug = String.fromCharCode(i + 65) + String.fromCharCode(j + 65);
        currentKey.plugboard = originalPlugs === '' ? plug : `${originalPlugs} ${plug}`;

        const e = Enigma.fromKey(currentKey);
        const decryption = e.encryptString(ciphertext);
        const fitness = f.score(decryption);
        if (fitness > maxFitness) {
          maxFitness = fitness;
          optimalPlugSetting = plug;
        }
      }
    }

    return optimalPlugSetting;
  }

  /** Hill-climbs the plugboard, adding up to `maxPlugs` plugs one at a time. */
  static findPlugs(key, maxPlugs, ciphertext, f) {
    const currentKey = EnigmaKey.copy(key);
    let plugs = '';
    for (let i = 0; i < maxPlugs; i++) {
      currentKey.plugboard = plugs;
      const nextPlug = EnigmaAnalysis.findPlug(currentKey, ciphertext, f);
      plugs = plugs === '' ? nextPlug : `${plugs} ${nextPlug}`;
    }

    currentKey.plugboard = plugs;
    // Calculate fitness and return scored key
    const e = Enigma.fromKey(currentKey);
    const decryption = e.encryptString(ciphertext);
    return new ScoredEnigmaKey(currentKey, f.score(decryption));
  }
}
