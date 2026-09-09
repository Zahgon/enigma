import { EnigmaAnalysis, AvailableRotors } from './analysis/EnigmaAnalysis.js';
import { Enigma } from './enigma/Enigma.js';
import { IoCFitness } from './analysis/fitness/IoCFitness.js';
import { BigramFitness } from './analysis/fitness/BigramFitness.js';
import { QuadramFitness } from './analysis/fitness/QuadramFitness.js';

function main() {
  const ioc = new IoCFitness();
  const bigrams = new BigramFitness();
  const quadgrams = new QuadramFitness();

  const startTime = Date.now();

  // For those interested, these were the original settings
  // II V III / 7 4 19 / 12 2 20 / AF TV KO BL RW
  const ciphertext =
    'OZLUDYAKMGMXVFVARPMJIKVWPMBVWMOIDHYPLAYUWGBZFAFAFUQFZQISLEZMYPVBRDDLAGIHIFUJDFADORQOOMIZPYXDCBPWDSSNUSYZTJEWZPWFBWBMIEQXRFASZLOPPZRJKJSPPSTXKPUWYSKNMZZLHJDXJMMMDFODIHUBVCXMNICNYQBNQODFQLOGPZYXRJMTLMRKQAUQJPADHDZPFIKTQBFXAYMVSZPKXIQLOQCVRPKOBZSXIUBAAJBRSNAFDMLLBVSYXISFXQZKQJRIQHOSHVYJXIFUZRMXWJVWHCCYHCXYGRKMKBPWRDBXXRGABQBZRJDVHFPJZUSEBHWAEOGEUQFZEEBDCWNDHIAQDMHKPRVYHQGRDYQIOEOLUBGBSNXWPZCHLDZQBWBEWOCQDBAFGUVHNGCIKXEIZGIZHPJFCTMNNNAUXEVWTWACHOLOLSLTMDRZJZEVKKSSGUUTHVXXODSKTFGRUEIIXVWQYUIPIDBFPGLBYXZTCOQBCAHJYNSGDYLREYBRAKXGKQKWJEKWGAPTHGOMXJDSQKYHMFGOLXBSKVLGNZOAXGVTGXUIVFTGKPJU';

  // Begin by finding the best combination of rotors and start positions (returns top n)
  const rotorConfigurations = EnigmaAnalysis.findRotorConfiguration(
    ciphertext,
    AvailableRotors.FIVE,
    '',
    10,
    ioc,
  );

  console.log('\nTop 10 rotor configurations:');
  for (const key of rotorConfigurations) {
    console.log(
      `${key.rotors[0]} ${key.rotors[1]} ${key.rotors[2]} / ` +
        `${key.indicators[0]} ${key.indicators[1]} ${key.indicators[2]} / ` +
        `${key.getScore().toFixed(6)}`,
    );
  }
  console.log(
    `Current decryption: ${Enigma.fromKey(rotorConfigurations[0]).encryptString(ciphertext)}\n`,
  );

  // Next find the best ring settings for the best configuration (index 0)
  const rotorAndRingConfiguration = EnigmaAnalysis.findRingSettings(
    rotorConfigurations[0],
    ciphertext,
    bigrams,
  );

  console.log(
    `Best ring settings: ${rotorAndRingConfiguration.rings[0]} ` +
      `${rotorAndRingConfiguration.rings[1]} ${rotorAndRingConfiguration.rings[2]}`,
  );
  console.log(
    `Current decryption: ${Enigma.fromKey(rotorAndRingConfiguration).encryptString(ciphertext)}\n`,
  );

  // Finally, perform hill climbing to find plugs one at a time
  const optimalKeyWithPlugs = EnigmaAnalysis.findPlugs(
    rotorAndRingConfiguration,
    5,
    ciphertext,
    quadgrams,
  );
  console.log(`Best plugboard: ${optimalKeyWithPlugs.plugboard}`);
  console.log(
    `Final decryption: ${Enigma.fromKey(optimalKeyWithPlugs).encryptString(ciphertext)}\n`,
  );

  const endTime = Date.now();

  console.log(`Total execution time: ${endTime - startTime}`);
}

main();
