/**
 * Example usage
 */
const bigInt = require('big-integer');
const toPubKey = require('./toPubKey');

// Example private to public key
const privateKey = new bigInt('18E14A7B6A307F426A94F8114701E7C8E774E7F9A47E2C2035DB29A206321725', 16);
console.log('Private key:\n', privateKey.toString(16));

const pubKey = toPubKey(privateKey);

const expectedResult = '0450863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b23522cd470243453a299fa9e77237716103abc11a1df38855ed6f2ee187e9c582ba6';
if (pubKey.toHex() === expectedResult) {
  console.log('Resulting public key:\n', pubKey.toHex());
} else {
  console.log('Oops, something wen\'t wrong');
}
