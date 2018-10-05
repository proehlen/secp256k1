const cashlib = require('cashlib');
const stringfu = require('stringfu');

const privKeyBytes = '00'.repeat(63) + '69';
const privKey = new cashlib.PrivateKey(stringfu.toBytes(privKeyBytes));
const pubKey = cashlib.PublicKey.fromPrivateKey(privKey);
const pubKeyHex = stringfu.fromBytes(pubKey.bytes);
console.log(pubKeyHex);
console.log(pubKeyHex.substr(0, 2) === '04');
console.log(pubKeyHex.substr(2, 64) === 'f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63');
console.log(pubKeyHex.substr(66, 64) === '4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1');
