import PSD from "./PSD";

export default class GlobalLayerMaskInfo {
  length: number;
  overlay_color_space: number;
  constructor({ file }: PSD) {
    this.length = file.int();
    this.overlay_color_space = file.short();
  }
}