import PSD from "./PSD";
import CompressionMethod from "./CompressionMethod";

export default class ImageData {
  compression_method: CompressionMethod;
  constructor({ file }: PSD) {
    this.compression_method = file.short();
    if (this.compression_method === CompressionMethod.RLE) {
    }
  }
}