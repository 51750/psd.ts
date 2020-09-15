import PSD from "./PSD";

export default class ColorModeData {
  length: number;
  constructor({ file }: PSD) {
    this.length = file.int();
    file.offset(this.length);
  }
}