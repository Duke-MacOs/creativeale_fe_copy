export function validateVersion3_8(binary: Uint8Array): boolean {
  const data = new BinaryInput(binary);
  data.readString();
  const version = data.readString();
  if (version) return version.startsWith('3.8');
  return false;
}

export function validateVersion4_0(binary: Uint8Array): boolean {
  const data = new BinaryInput(binary);
  data.readInt32();
  data.readInt32();
  const version = data.readString();
  if (version) return version.startsWith('4.0');
  return false;
}

class BinaryInput {
  strings: string[];
  index: number;
  buffer: DataView;
  constructor(data: Uint8Array, strings = [], index = 0, buffer = new DataView(data.buffer)) {
    this.strings = strings;
    this.index = index;
    this.buffer = buffer;
  }
  readByte() {
    return this.buffer.getInt8(this.index++);
  }
  readUnsignedByte() {
    return this.buffer.getUint8(this.index++);
  }
  readShort() {
    const value = this.buffer.getInt16(this.index);
    this.index += 2;
    return value;
  }
  readInt32() {
    const value = this.buffer.getInt32(this.index);
    this.index += 4;
    return value;
  }
  readInt(optimizePositive: any) {
    let b = this.readByte();
    let result = b & 0x7f;
    if ((b & 0x80) !== 0) {
      b = this.readByte();
      result |= (b & 0x7f) << 7;
      if ((b & 0x80) !== 0) {
        b = this.readByte();
        result |= (b & 0x7f) << 14;
        if ((b & 0x80) !== 0) {
          b = this.readByte();
          result |= (b & 0x7f) << 21;
          if ((b & 0x80) !== 0) {
            b = this.readByte();
            result |= (b & 0x7f) << 28;
          }
        }
      }
    }
    return optimizePositive ? result : (result >>> 1) ^ -(result & 1);
  }
  readStringRef() {
    const index = this.readInt(true);
    return index === 0 ? null : this.strings[index - 1];
  }
  readString() {
    let byteCount = this.readInt(true);
    switch (byteCount) {
      case 0:
        return null;
      case 1:
        return '';
    }
    byteCount--;
    let chars = '';
    for (let i = 0; i < byteCount; ) {
      const b = this.readByte();
      switch (b >> 4) {
        case 12:
        case 13:
          chars += String.fromCharCode(((b & 0x1f) << 6) | (this.readByte() & 0x3f));
          i += 2;
          break;
        case 14:
          chars += String.fromCharCode(((b & 0x0f) << 12) | ((this.readByte() & 0x3f) << 6) | (this.readByte() & 0x3f));
          i += 3;
          break;
        default:
          chars += String.fromCharCode(b);
          i++;
      }
    }
    return chars;
  }
  readFloat() {
    const value = this.buffer.getFloat32(this.index);
    this.index += 4;
    return value;
  }
  readBoolean() {
    return this.readByte() !== 0;
  }
}
