import PSD from "./PSD";
import DescriptorStructure from "./DescriptorStructure";

export default class TypeToolObjectSetting {
  version: number;
  xx: number;
  xy: number;
  yx: number;
  yy: number;
  tx: number;
  ty: number;
  text_version: number;
  descriptor_version_1: number;
  text_data: DescriptorStructure;
  warp_version: number;
  descriptor_version_2: number;
  warp_data: DescriptorStructure;
  // left: number;
  // top: number;
  // right: number;
  // bottom: number;
  constructor(psd: PSD) {
    const { file } = psd;
    this.version = file.short();
    this.xx = file.double();
    this.xy = file.double();
    this.yx = file.double();
    this.yy = file.double();
    this.tx = file.double();
    this.ty = file.double();
    this.text_version = file.short();
    this.descriptor_version_1 = file.int();
    this.text_data = new DescriptorStructure(psd);
    this.warp_version = file.short();
    this.descriptor_version_2 = file.int();
    this.warp_data = new DescriptorStructure(psd);
    // this.left = file.double();
    // this.top = file.double();
    // this.right = file.double();
    // this.bottom = file.double();
  }
}