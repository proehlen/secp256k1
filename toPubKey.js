/**
 * Function for converting a private key to a public key
 */
const bigInt = require('big-integer');
const Point = require('./Point');

// secp256k1 constants.  Unlike for other curves, we only need 3 here.  They are:
//   field.  aka 'p' - integer specifying the finite field
//   basePoint. aka 'G = (xG, yG)'
//   prime. aka 'n' - a prime which is the order of basePoint/G
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

  const privKeyBits = privKey.toString(2).split('');
  let q = new Point(basePoint.x, basePoint.y);
  for (let i = 1; i <  privKeyBits.length; i++) {
    q = ecDouble(q);
    if (privKeyBits[i] === '1') {
      q = ecAdd(q);
    }
  }
  return q;
}

module.exports = toPubKey;
