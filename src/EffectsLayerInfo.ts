import PSD from "./PSD";
import Color from "./Color";

class Common {
  version: number;
  visible: boolean;
  unused: number;
  constructor({ file }: PSD) {
    this.version = file.int();
    this.visible = file.boolean();
    this.unused = file.short();
  }
}

/** 阴影 */
class Shadow {
  version: number;
  blur: number;
  intensity: number;
  angle: number;
  distance: number;
  color: Color;
  blend_mode: number[];
  enabled: boolean;
  global_illumination: boolean;
  opacity: number;
  native_color_space: Color;
  constructor(psd: PSD) {
    const { file } = psd;
    this.version = file.int();
    this.blur = file.int() / 0x10000;
    this.intensity = file.int() / 0x10000;
    this.angle = file.int() / 0x10000;
    this.distance = file.int() / 0x10000;
    this.color = new Color(psd);
    this.blend_mode = file.read(8);
    this.enabled = file.boolean();
    this.global_illumination = file.boolean();
    this.opacity = file.byte();
    this.native_color_space = new Color(psd);
  }
}

/** 发光 */
abstract class Glow {
  version: number;
  blur: number;
  intensity: number;
  color: Color;
  blend_mode: number[];
  enabled: boolean;
  opacity: number;
  constructor(psd: PSD) {
    const { file } = psd;
    this.version = file.int();
    this.blur = file.int() / 0x10000;
    this.intensity = file.int() / 0x10000;
    this.color = new Color(psd);
    this.blend_mode = file.read(8);
    this.enabled = file.boolean();
    this.opacity = file.byte();
  }
}

/** 外发光 */
class OuterGlow extends Glow {
  native_color_space?: Color;
  constructor(psd: PSD) {
    super(psd);
    const { file } = psd;
    if (this.version === 2) {
      this.native_color_space = new Color(psd);
    }
  }
}

/** 内发光 */
class InnerGlow extends Glow {
  invert?: number;
  native_color_space?: Color;
  constructor(psd: PSD) {
    super(psd);
    const { file } = psd;
    if (this.version === 2) {
      this.invert = file.byte();
      this.native_color_space = new Color(psd);
    }
  }
}

/** 斜面 */
class Bevel {
  version: number;
  angle: number;
  strength_depth: number;
  blur: number;
  highlight_blend_mode: number[];
  shadow_blend_mode: number[];
  highlight_color: Color;
  shadow_color: Color;
  bevel_style: number;
  hightlight_opacity: number;
  shadow_opacity: number;
  enabled: boolean;
  global_illumination: number;
  up_or_down: boolean;
  real_highlight_color?: Color;
  real_shadow_color?: Color;
  constructor(psd: PSD) {
    const { file } = psd;
    this.version = file.int();
    this.angle = file.int() / 0x10000;
    this.strength_depth = file.int() / 0x10000;
    this.blur = file.int() / 0x10000;
    this.highlight_blend_mode = file.read(8);
    this.shadow_blend_mode = file.read(8);
    this.highlight_color = new Color(psd);
    this.shadow_color = new Color(psd);
    this.bevel_style = file.byte();
    this.hightlight_opacity = file.byte();
    this.shadow_opacity = file.byte();
    this.enabled = file.boolean();
    this.global_illumination = file.byte();
    this.up_or_down = file.boolean();
    if (this.version === 2) {
      this.real_highlight_color = new Color(psd);
      this.real_shadow_color = new Color(psd);
    }
  }
}

/** 描边 */
class SolidFill {
  version: number;
  key_for_blend_mode: string;
  color_space: Color;
  opacity: number;
  enabled: boolean;
  native_color_space: Color;
  constructor(psd: PSD) {
    const { file } = psd;
    this.version = file.int();
    this.key_for_blend_mode = file.string(4);
    this.color_space = new Color(psd);
    this.opacity = file.byte();
    this.enabled = file.boolean();
    this.native_color_space = new Color(psd);
  }
}

export default class EffectsLayerInfo {
  version: number;
  count: number;
  common?: Common;
  drop_shadow?: Shadow;
  inner_shadow?: Shadow;
  outer_glow?: OuterGlow;
  inner_glow?: InnerGlow;
  bevel?: Bevel;
  solid_fill?: SolidFill;
  constructor(psd: PSD) {
    const { file } = psd;
    this.version = file.short();
    this.count = file.short();
    for (let i = 0; i < this.count; i++) {
      const signature = file.string(4);
      const key = file.string(4);
      const length = file.int();
      switch (key) {
        case "cmnS": this.common = new Common(psd); break;
        case "dsdw": this.drop_shadow = new Shadow(psd); break;
        case "isdw": this.inner_shadow = new Shadow(psd); break;
        case "oglw": this.outer_glow = new OuterGlow(psd); break;
        case "iglw": this.inner_glow = new InnerGlow(psd); break;
        case "bevl": this.bevel = new Bevel(psd); break;
        case "sofi": this.solid_fill = new SolidFill(psd); break;
        default: file.offset(length); break;
      }
    }
  }
}