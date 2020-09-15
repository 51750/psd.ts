
import File from "./File";
import Header from "./Header";
import ColorModeData from "./ColorModeData";
import ImageResources from "./ImageResources";
import LayerAndMaskInfomation from "./LayerAndMaskInfomation";
import ImageData from "./ImageData";

export default class PSD {
  file: File;
  header: Header;
  color_mode_data: ColorModeData;
  image_resources: ImageResources;
  layer_and_mask_infomation: LayerAndMaskInfomation;
  image_data: ImageData;
  constructor(buffer: Buffer) {
    this.file = new File(buffer);
    this.header = new Header(this);
    this.color_mode_data = new ColorModeData(this);
    this.image_resources = new ImageResources(this);
    this.layer_and_mask_infomation = new LayerAndMaskInfomation(this);
    this.image_data = new ImageData(this);
  }
}