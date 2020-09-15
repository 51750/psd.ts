import PSD from "./PSD";

export default class ImageResources {
  length: number;
  constructor({ file }: PSD) {
    this.length = file.int();
    file.offset(this.length);
  }
}