import * as maptalks from "maptalks";
import * as THREE from "three";
import { BaseObject } from "maptalks.three";

var OPTIONS = {
  radius: 5,
  altitude: 0,
};

class Circle extends BaseObject {
  constructor(coordinate, options, material, layer) {
    options = maptalks.Util.extend({}, OPTIONS, options, { layer, coordinate });
    super();
    this._initOptions(options);
    const { altitude, radius } = options;
    const r = layer.distanceToVector3(radius, radius).x;
    const geometry = new THREE.CircleGeometry(r, 50);
    this._createMesh(geometry, material);
    const z = layer.distanceToVector3(altitude, altitude).x;
    const position = layer.coordinateToVector3(coordinate, z);
    this.getObject3d().position.copy(position);
  }
}
export default Circle;
