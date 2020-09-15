import PSD from "./PSD";

export enum ChannelID {
  RED = 0,
  GREEN = 1,
  BLUE = 2,
  TRANSPARENCY_MASK = -1,
  USER_SUPPLIED_LAYER_MASK = -2,
  REAL_USER_SUPPLIED_LAYER_MASK = -4,
}

export default class ChannelInfo {
  id: ChannelID;
  length: number;
  data?: number[];
  constructor({ file }: PSD) {
    this.id = file.short();
    this.length = file.int();
  }
}