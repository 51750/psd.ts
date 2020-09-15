import { jspack } from "jspack";
import iconv from "iconv-lite";

export default class File {
  private _buffer: Buffer;
  private _pos = 0;
  public get buffer(): Buffer {
    return this._buffer;
  }
  public get pos(): number {
    return this._pos;
  }
  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }
  read(length: number) {
    const self = this;
    const temp = [];
    for (let i = 0; i < length; i++) {
      temp.push(self.buffer[this._pos++])
    }
    return temp;
  }
  byte() {
    return this.read(1)[0];
  }
  short(): number {
    return jspack.Unpack('h', this.read(2))[0]
  }
  unsignedShort() {
    return jspack.Unpack('H', this.read(2))[0]
  }
  int(): number {
    return jspack.Unpack('i', this.read(4))[0]
  }
  double(): number {
    return jspack.Unpack('d', this.read(8))[0]
  }
  string(length: number): string {
    return jspack.Unpack(length + 's', this.read(length))[0].replace(/\u0000/g, '')
  }
  unicodeString() {
    const length = this.int() * 2;
    const data = this.read(length);
    return iconv.decode(Buffer.from(data), "utf-16be").replace(/\u0000/g, '');
  }
  utf16String(length: number) {
    const data = this.read(length);
    return iconv.decode(Buffer.from(data), "utf-16");
  }
  gbkString(length: number) {
    const bytes = this.read(length);
    return iconv.decode(Buffer.from(bytes), "gbk");
  }
  id() {
    const length = this.int() || 4;
    return this.string(length);
  }
  boolean() {
    return this.byte() == 1;
  }
  rle(height: number) {
    const bytes: number[] = [];
    for (var i = 0; i < height; i++) {
      bytes.push(this.short());
    }
    const data: number[] = [];
    for (let i = 0; i < height; i++) {
      const byteCount = bytes[i];
      const endPos = this.pos + byteCount;
      while (this.pos < endPos) {
        let length = this.byte();
        if (length < 128) {
          length++;
          data.splice.apply(data, [data.length, 0, ...[].slice.call(this.read(length))]);
        } else if (length > 128) {
          length ^= 0xff;
          length += 2;
          const value = this.byte();
          for (let l = 0; l < length; l++) {
            data.push(value);
          }
        }
      }
    }
    return data
  };
  offset(offset: number, whence?: number) {
    if (whence && !isNaN(whence)) {
      this._pos = whence;
    }
    this._pos += offset;
    return this._pos
  }
  move(whence: number) {
    this._pos = whence;
    return this._pos
  }
}
