import PSD from "./PSD";

export default class LayerBlendingRangesData {
  length: number;
  constructor({ file }: PSD) {
    this.length = file.int();
    file.offset(this.length);
  }
}