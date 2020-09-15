import PSD from "./PSD";
import LayerInfo from "./LayerInfo";

export default class LayerAndMaskInfomation {
  length: number;
  layer_info: LayerInfo;
  constructor(psd: PSD) {
    const { file } = psd;
    const length = file.int();
    const end = file.pos + length;
    this.length = length;
    this.layer_info = new LayerInfo(psd);
    file.move(end);
  }
}