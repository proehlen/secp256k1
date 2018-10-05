const bigInt = require('big-integer');
const crypto = require('crypto'); // To check results
const stringfu = require('stringfu');

class Point {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  get x() { return this._x; }
  get y() { return this._y; }

  toHex(compressionByte = false) {
    const x = stringfu.leftPad(this.x.toString(16), 64, '0');
    const y = stringfu.leftPad(this.y.toString(16), 64, '0');
    const prefix = compressionByte
      ? '04'
      : '';
    return `${prefix}${x}${y}`;
  }
}

// secp256k1 constants.  Unlike for other curves, we only need 3 here.  They are:
// field.  aka 'p' - integer specifying the finite field
// basePoint. aka 'G = (xG, yG)'
// prime. aka 'n' - a prime which is the order of basePoint/G
const field = bigInt('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F', 16);
const basePoint = new Point(
  bigInt('79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798', 16),
  bigInt('483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8', 16),
);
const prime = bigInt('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141', 16);

function ecAdd(point) {
  const lamda = basePoint.y
    .subtract(point.y)
    .multiply(
      basePoint.x.subtract(point.x).modInv(field)
    )
    .mod(field);
  const xR = lamda
    .pow(2)
    .subtract(point.x)
    .subtract(basePoint.x)
    .mod(field);
  let yR = lamda
    .multiply(point.x.subtract(xR))
    .subtract(point.y)
    .mod(field);
  if (yR.isNegative()) {
    yR = yR.add(field);
  }
  return new Point(xR, yR);
}

function ecDouble(point) {
  const lamda = point.x
    .pow(2)
    .multiply(3)
    .multiply(
      point.y.multiply(2).modInv(field)
    ).mod(field);
  const xR = lamda
    .pow(2)
    .subtract(point.x.multiply(2))
    .mod(field);
  let yR = lamda
    .multiply(point.x.subtract(xR))
    .subtract(point.y)
    .mod(field);
  
  if (yR.isNegative()) {
    yR = yR.add(field);
  }
  
  return new Point(xR, yR);
}

function toPubKey(privKey) {
  if (privKey === 0 || privKey >= prime) {
    throw new Error('Invalid private key');
  }

  const keyBits = privKey.toString(2).split('');
  let q = new Point(basePoint.x, basePoint.y);
  for (let i = 1; i <  keyBits.length; i++) {
    q = ecDouble(q);
    if (keyBits[i] === '1') {
      q = ecAdd(q);
    }
  }
  return q;
}

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
    const pubKey = toPubKey(privKey).toHex();

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

const from = 100100;
const to = 101000;
console.log(`Checking private keys from ${from} to ${to}`)

const stats = check(from, to, 'standard');
console.log(`Correct: ${stats.correct}, incorrect: ${stats.incorrect}`);
console.log(`X correct: ${stats.x.correct}, incorrect: ${stats.x.incorrect}`);
console.log(`Y correct: ${stats.y.correct}, incorrect: ${stats.y.incorrect}`);
