/**
 * Check a number of results of this package's toPubKey against node crypto package
 */

const bigInt = require('big-integer');
const crypto = require('crypto'); // To check results
const stringfu = require('stringfu');
const toPubKey = require('./toPubKey');

/**
 * output: 'none' | 'standard' | 'verbose'
 */
function check(from, to, output = 'standard') {
  const results = {
    correct: 0,
    incorrect: 0,
    x: {
      correct: 0,
      incorrect: 0,
    },
    y: {
      correct: 0,
      incorrect: 0,
    },
  }
  for (let i = from; i <= to; i++) {
    const privKey = new bigInt(i);
  
    // Get public key using our code
    const pubKey = toPubKey(privKey).toHex(false);

    // Generate key using node crypto
    const ecdh = crypto.createECDH('secp256k1');
    const privKeyHex = stringfu.leftPad(privKey.toString(16), 64, '0');
    ecdh.setPrivateKey(privKeyHex, 'hex');
    const check = ecdh.getPublicKey('hex', 'uncompressed').substr(2);

    const pubKeyCorrect = pubKey === check;
    const halfKey = check.length / 2;
    const xCorrect = pubKey.substr(0, halfKey) === check.substr(0, halfKey);
    const yCorrect = pubKey.substr(halfKey) === check.substr(halfKey);
    if (pubKeyCorrect) {
      results.correct++;
      results.x.correct++;
      results.y.correct++;
      if (output === 'verbose') console.log('Public key for private key ', i, 'correct');
    } else {
      results.incorrect++;
      if (!xCorrect) results.x.incorrect++;
      if (!yCorrect) results.y.incorrect++;
      if (output !== 'none') {
        console.log('Public key for private key ', i, 'NOT correct. x:', xCorrect, '  y:', yCorrect);
        if (output === 'verbose') {
          console.log('Generated:', pubKey);
          console.log('Expected: ', check);
        }
      }
    }
  }
  return results;
}

const from = 100001;
const to = 200000;
console.log(`Checking private keys from ${from} to ${to}`)

const stats = check(from, to, 'standard');
console.log(`Correct: ${stats.correct}, incorrect: ${stats.incorrect}`);
console.log(`X correct: ${stats.x.correct}, incorrect: ${stats.x.incorrect}`);
console.log(`Y correct: ${stats.y.correct}, incorrect: ${stats.y.incorrect}`);

module.exports = check;