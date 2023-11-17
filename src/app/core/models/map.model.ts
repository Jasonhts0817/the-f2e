export class TaiwanMap {
  type: 'Topology';
  transform: Transform;
  objects: Objects;
  arcs: Array<Array<number[]>>;
  bbox: number[];
  constructor(data: TaiwanMap) {
    this.type = data.type;
    this.transform = new Transform(data.transform);
    this.objects = new Objects(data.objects);
    this.arcs = data.arcs;
    this.bbox = data.bbox;
  }
}

export class Objects {
  map: MapObject;
  constructor(object: Objects) {
    this.map = new MapObject(object.map);
  }
}

export class MapObject {
  type: string;
  geometries: Geometry[];
  bbox: number[];
  constructor(map: MapObject) {
    this.type = map.type;
    this.geometries = map.geometries
      .filter((g) => g.arcs)
      .map((geometry) => new Geometry(geometry));
    this.bbox = map.bbox;
  }
}

export class Geometry {
  type: string;
  properties: Properties;
  arcs?: Array<number[]>;
  constructor(geometry: Geometry) {
    this.type = geometry.type;
    this.properties = new Properties(geometry.properties);
    this.arcs = geometry.arcs;
  }
}

export class Properties {
  id: string;
  name: string;
  constructor(properties: Properties) {
    this.id = properties.id;
    this.name = properties.name;
  }
}

export class Transform {
  scale: number[];
  translate: number[];
  constructor(transform: Transform) {
    this.scale = transform.scale;
    this.translate = transform.translate;
  }
}
