import PSD from "./PSD";
import LayerRecord from "./LayerRecord";
import { pad2 } from "./utils";

export default class LayerInfo {
  length: number;
  count: number;
  layer_record: LayerRecord[] = [];
  constructor(psd: PSD) {
    const { file } = psd;
    const length = pad2(file.int());
    const end = file.pos + length;
    this.length = length;
    this.count = Math.abs(file.short());
    // 图层数据
    for (var i = 0; i < this.count; i++) {
      this.layer_record.push(new LayerRecord(psd));
    }
    // 通道图像数据
    let start = file.pos;
    for (var i = 0; i < this.layer_record.length; i++) {
      const layer = this.layer_record[i];
      layer.channel_image_data_start = start;
      start += layer.channel_info.reduce((previous, { length }) => previous + length, 0);
    }
    file.move(end);
  }
}