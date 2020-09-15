import PSD from "./PSD";
import LayerMaskOrAdjustmentLayerData from "./LayerMaskOrAdjustmentLayerData";
import LayerBlendingRangesData from "./LayerBlendingRangesData";
import EffectsLayerInfo from "./EffectsLayerInfo";
import BlendMode from "./BlendMode";
import TypeToolObjectSetting from "./TypeToolObjectSetting";
import DescriptorStructure from "./DescriptorStructure";
import ChannelInfo, { ChannelID } from "./ChannelInfo";
import { pad4, pad2 } from "./utils";
import CompressionMethod from "./CompressionMethod";
import { PNG } from "pngjs";
import { createWriteStream } from "fs";

export enum Clipping { BASE, NON_BASE }

export default class LayerRecord {
  psd: PSD;
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
  channel_count: number;
  channel_info: ChannelInfo[] = [];
  channel_image_data_start?: number;
  blend_mode_signature: string;
  blend_mode: BlendMode;
  opacity: number;
  clipping: Clipping;
  visible: boolean;
  layer_mask_or_adjustment_layer_data: LayerMaskOrAdjustmentLayerData;
  layer_blending_ranges_data: LayerBlendingRangesData;
  layer_name: string;
  effects_layer_info?: EffectsLayerInfo;
  type_tool_object_setting?: TypeToolObjectSetting;
  unicode_layer_name?: string;
  object_based_effects_layer_info?: DescriptorStructure;
  // unknow: any = {};
  constructor(psd: PSD) {
    const { file } = psd;
    this.psd = psd;
    this.top = file.int();
    this.left = file.int();
    this.bottom = file.int();
    this.right = file.int();
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
    this.channel_count = file.short();
    for (let i = 0; i < this.channel_count; i++) {
      this.channel_info.push(new ChannelInfo(psd));
    }
    this.blend_mode_signature = file.string(4);
    this.blend_mode = file.string(4) as BlendMode;
    this.opacity = file.byte();
    this.clipping = file.byte();
    this.visible = !((file.byte() & (0x01 << 1)) > 0);
    file.offset(1);

    //额外数据，由于Photoshop的迭代升级，这段数据以这样蛋疼的方式追加，Adobe坑爹 (╯°Д°)╯ ┻━┻
    const extraLength = file.int();
    const end = file.pos + extraLength;
    this.layer_mask_or_adjustment_layer_data = new LayerMaskOrAdjustmentLayerData(psd);
    this.layer_blending_ranges_data = new LayerBlendingRangesData(psd);
    this.layer_name = file.gbkString(pad4(file.byte()) - 1);

    //Additional Layer Information，接下来Photoshop升级到了4.0，Adobe继续坑爹 w(ﾟДﾟ)w
    while (file.pos < end) {
      const signature = file.string(4)
      const key = file.string(4)
      const length = pad2(file.int());
      const end = file.pos + length;
      switch (key) {
        case "lrFX": this.effects_layer_info = new EffectsLayerInfo(psd); break;
        case "TySh": this.type_tool_object_setting = new TypeToolObjectSetting(psd); break;
        case "luni": this.unicode_layer_name = file.unicodeString(); break;
        case "lfx2": file.offset(8); this.object_based_effects_layer_info = new DescriptorStructure(psd); break;
        // default: this.unknow[key] = { length, data: file.read(length) }; break;
      }
      file.move(end);
    }
  }

  private parsePixelData() {
    const { width, height, channel_info } = this;
    const pixelNum = width * height;
    const pixelData = [];
    for (let j = 0; j < pixelNum; j++) {
      let r = 0, g = 0, b = 0, a = 255;
      for (let i = 0; i < channel_info.length; i++) {
        const info = channel_info[i];
        if (info.data) {
          switch (info.id) {
            case ChannelID.RED: r = info.data[j]; break;
            case ChannelID.GREEN: g = info.data[j]; break;
            case ChannelID.BLUE: b = info.data[j]; break;
            case ChannelID.TRANSPARENCY_MASK: a = info.data[j]; break;
          }
        }
      }
      pixelData.push(r, g, b, a);
    }
    return pixelData
  };

  saveAsPNG(out: string) {
    if (this.channel_image_data_start) {
      const { file } = this.psd;
      file.move(this.channel_image_data_start);
      for (let i = 0; i < this.channel_info.length; i++) {
        const channel = this.channel_info[i];
        const compression = file.short() as CompressionMethod;
        switch (compression) {
          case CompressionMethod.RAW: channel.data = file.read(this.width * this.height); break;
          case CompressionMethod.RLE: channel.data = file.rle(this.height); break;
          default: throw "Unsupported compression method.";
        }
      }
      const pixelData = this.parsePixelData();
      const png = new PNG({ width: this.width, height: this.height, filterType: 4 });
      if (pixelData) {
        png.data = Buffer.from(pixelData);
        png.pack().pipe(createWriteStream(out));
      }
    } else {
      throw "Channel Image Data is not exist.";
    }
  }

}
