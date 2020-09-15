import PSD from "./PSD";

export default class LayerMaskOrAdjustmentLayerData {
  length: number;
  constructor({ file }: PSD) {
    this.length = file.int();
    file.offset(this.length);
  }
}