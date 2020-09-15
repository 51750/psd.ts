import PSD from "./PSD";
import parseEngineData from "parse-engine-data";

function parseEnumerated({ file }: PSD) {
  const type = file.id();
  const value = file.id();
  return value;
};

function parseItem(psd: PSD) {
  const { file } = psd;
  const key = file.string(4);
  switch (key) {
    case "obj ": return new Reference(psd);
    case "Objc": return new DescriptorStructure(psd);
    case "VlLs": return new List(psd);
    case "doub": return file.double();
    case "UntF": return new UnitFloat(psd);
    case "TEXT": return file.unicodeString();
    case "enum": return parseEnumerated(psd);
    case "long": return file.int();
    case "comp": return file.double();
    case "bool": return file.boolean();
    case "GlbO": return new DescriptorStructure(psd);
    case "type": return new Class(psd);
    case "GlbC": return new Class(psd);;
    case "alis": return file.string(file.int());
    case "tdta": return JSON.stringify(parseEngineData(file.read(file.int())));
  }
}

class UnitFloat {
  unit: string;
  value: number;
  constructor({ file }: PSD) {
    const types = {
      '#Ang': 'Angle',
      '#Rsl': 'Density',
      '#Rlt': 'Distance',
      '#Nne': 'None',
      '#Prc': 'Percent',
      '#Pxl': 'Pixels',
      '#Mlm': 'Millimeters',
      '#Pnt': 'Points'
    };
    const key = file.string(4) as keyof typeof types;
    this.unit = types[key];
    this.value = file.double();
  }
}

class List {
  [key: number]: any;
  constructor(psd: PSD) {
    const { file } = psd;
    const count = file.int();
    for (let i = 0; i < count; i++) {
      this[i] = parseItem(psd);
    }
  }
}

class Class {
  name: string;
  id: string;
  constructor({ file }: PSD) {
    this.name = file.unicodeString();
    this.id = file.string(file.int() || 4);
  }
}

class Property {
  class: Class;
  id: string;
  constructor(psd: PSD) {
    const { file } = psd;
    this.class = new Class(psd);
    this.id = file.id();
  }
}

class EnumeratedReference {
  class: Class;
  type: string;
  value: string;
  constructor(psd: PSD) {
    const { file } = psd;
    this.class = new Class(psd);
    this.type = file.id();
    this.value = file.id();
  }
}

class Reference {
  prop?: Property;
  Clss?: Class;
  Enmr?: EnumeratedReference;
  rele?: number;
  indx?: number;
  constructor(psd: PSD) {
    const { file } = psd;
    const count = file.int();
    for (let i = 0; i < count; i++) {
      const key = file.string(4);
      switch (key) {
        case "prop": this.prop = new Property(psd); break;
        case "Clss": this.Clss = new Class(psd); break;
        case "Enmr": this.Enmr = new EnumeratedReference(psd); break;
        case "rele": this.rele = file.int(); break;
        case "indx": this.indx = file.int(); break;
      }
    }
  }
}

export default class DescriptorStructure extends Class {
  [key: string]: any
  constructor(psd: PSD) {
    super(psd);
    const { file } = psd;
    const count = file.int();
    for (let i = 0; i < count; i++) {
      const id = file.string(file.int() || 4);
      this[id] = parseItem(psd);
    }
  }
}