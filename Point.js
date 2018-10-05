/**
 * Simple Point class.  Expects parameters to be bigInt values (package 'big-integer')
 */
const stringfu = require('stringfu');

class Point {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  get x() { return this._x; }
  get y() { return this._y; }

  toHex(compressionByte = true) {
    const x = stringfu.leftPad(this.x.toString(16), 64, '0');
    const y = stringfu.leftPad(this.y.toString(16), 64, '0');
    const prefix = compressionByte
      ? '04'
      : '';
    return `${prefix}${x}${y}`;
  }
}

module.exports = Point;