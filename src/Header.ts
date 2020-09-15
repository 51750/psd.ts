import PSD from "./PSD";
import ColorMode from "./ColorMode";

export default class Header {
  signature: string;
  version: number;
  channel: number;
  height: number;
  width: number;
  depth: number;
  color_mode: ColorMode;
  constructor({ file }: PSD) {
    this.signature = file.string(4);
    this.version = file.short();
    file.offset(6);
    this.channel = file.short();
    this.height = file.int();
    this.width = file.int();
    this.depth = file.short();
    this.color_mode = file.short();
  }
}
