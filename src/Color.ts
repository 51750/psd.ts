import PSD from "./PSD";

export enum ColorID { RGB, HSB, CMYK, PANTONE, FOCOLTONE, TRUMATCH, TOYO, HKS, LAB, GRAYSCALE }

export class RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
  hex: number;
  hex_string: string;
  constructor({ file }: PSD) {
    this.r = Math.round(file.unsignedShort() / 0x100);
    this.g = Math.round(file.unsignedShort() / 0x100);
    this.b = Math.round(file.unsignedShort() / 0x100);
    this.a = Math.round(file.unsignedShort() / 0x100);
    this.hex = this.r * 0x10000 + this.g * 0x100 + this.b;
    this.hex_string = `#${this.hex.toString(16)}`;
  }
}

export default class Color {
  color_id: ColorID;
  rgb?: RGBAColor;
  constructor(psd: PSD) {
    const { file } = psd;
    this.color_id = file.short();
    switch (this.color_id) {
      case ColorID.RGB: this.rgb = new RGBAColor(psd); break;
      default: file.offset(8); break;
    }
  }
}
